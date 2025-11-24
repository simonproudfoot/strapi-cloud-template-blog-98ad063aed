import React, { useState } from 'react';
import { Play, Check } from '@strapi/icons';
import { useNotification } from '@strapi/strapi/admin';
import styled from 'styled-components';

import pluginId from '../../pluginId.js';

// Styled components for layout
const Container = styled.div`
  padding: 24px;
`;

const Card = styled.div`
  background: white;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background: ${props => props.loading ? '#ccc' : '#4945ff'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: ${props => props.loading ? 'not-allowed' : 'pointer'};
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.loading ? '#ccc' : '#3b38cc'};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const Subtitle = styled.h2`
  font-size: 18px;
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
`;

const PreviewTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const Text = styled.p`
  margin: 4px 0;
  color: ${props => props.color || '#333'};
  font-size: ${props => {
    if (props.variant === 'delta') return '18px';
    if (props.variant === 'epsilon') return '16px';
    return '14px';
  }};
`;

const Flex = styled.div`
  display: flex;
  justify-content: ${props => props.justifyContent || 'flex-start'};
  align-items: ${props => props.alignItems || 'flex-start'};
  gap: 16px;
`;

const Pre = styled.pre`
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  overflow: auto;
  max-height: 320px;
  font-size: 12px;
  white-space: pre-wrap;
`;

// Helper function to make API requests
const request = async (url, options = {}) => {
  const response = await fetch(`${window.strapi.backendURL || ''}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const App = () => {
  const toggleNotification = useNotification();
  const [query, setQuery] = useState('');
  const [dietaryRequirements, setDietaryRequirements] = useState('');
  const [servingSize, setServingSize] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);

  const handleGenerate = async () => {
    if (!query.trim()) {
      toggleNotification({
        type: 'warning',
        message: {
          id: `${pluginId}.notification.missing-query`,
          defaultMessage: 'Please enter a prompt first.',
        },
      });
      return;
    }

    setIsGenerating(true);
    try {
      const data = await request(`/${pluginId}/generate`, {
        method: 'POST',
        body: {
          query,
          dietaryRequirements: dietaryRequirements || undefined,
          servingSize: servingSize || undefined,
        },
      });
      setGeneratedRecipe(data.recipe);
      setRawResponse(data.raw || null);
      toggleNotification({
        type: 'success',
        message: {
          id: `${pluginId}.notification.generated`,
          defaultMessage: 'Recipe generated successfully.',
        },
      });
    } catch (error) {
      console.error('AI recipe generation failed', error);
      toggleNotification({
        type: 'danger',
        message: error?.message || 'Failed to generate recipe.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreate = async () => {
    if (!generatedRecipe) {
      toggleNotification({
        type: 'warning',
        message: {
          id: `${pluginId}.notification.no-recipe`,
          defaultMessage: 'Generate a recipe before saving.',
        },
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await request(`/${pluginId}/create`, {
        method: 'POST',
        body: {
          recipe: generatedRecipe,
        },
      });
      setGeneratedRecipe(null);
      setRawResponse(null);
      toggleNotification({
        type: 'success',
        message: {
          id: `${pluginId}.notification.create-success`,
          defaultMessage: 'Recipe saved to Strapi.',
        },
      });
      if (typeof window !== 'undefined' && result?.recipe?.id) {
        const url = `/content-manager/collectionType/api::recipe.recipe/${result.recipe.id}`;
        window.open(url, '_blank', 'noopener');
      }
    } catch (error) {
      toggleNotification({
        type: 'danger',
        message: error?.message || 'Failed to save recipe.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container>
      <Title>AI Recipe Generator</Title>
      <Subtitle>Generate curated recipes with the live chat API and save them into Strapi.</Subtitle>
      
      <Card>
        <FormGroup>
          <Label htmlFor="query">Prompt</Label>
          <TextArea
            id="query"
            name="query"
            placeholder="e.g. Give me a quick midweek chicken pasta"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
            rows={4}
          />
        </FormGroup>
        
        <Grid>
          <FormGroup>
            <Label htmlFor="dietaryRequirements">Dietary requirements</Label>
            <Input
              id="dietaryRequirements"
              name="dietaryRequirements"
              type="text"
              placeholder="Optional – e.g. Vegetarian"
              value={dietaryRequirements}
              onChange={(e) => setDietaryRequirements(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="servingSize">Serving size</Label>
            <Input
              id="servingSize"
              name="servingSize"
              type="text"
              placeholder="Optional – e.g. Serves 2"
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
            />
          </FormGroup>
        </Grid>
        
        <Button onClick={handleGenerate} loading={isGenerating} disabled={isGenerating}>
          <Play /> Generate recipe
        </Button>
      </Card>

      {generatedRecipe && (
        <Card>
          <Flex justifyContent="space-between" alignItems="center">
            <PreviewTitle>Preview</PreviewTitle>
            <Button onClick={handleCreate} loading={isSaving} disabled={isSaving}>
              <Check /> Save to Strapi
            </Button>
          </Flex>
          
          <div>
            <Text variant="delta">{generatedRecipe.name || generatedRecipe.title}</Text>
            {generatedRecipe.description && (
              <Text color="#666">{generatedRecipe.description}</Text>
            )}
            
            <div style={{ marginTop: '16px' }}>
              <SectionTitle>Ingredients</SectionTitle>
              {generatedRecipe.ingredients?.map((ingredient, index) => (
                <Text key={`${ingredient.name}-${index}`} color="#555">
                  {ingredient.quantity ? `${ingredient.quantity} ` : ''}
                  {ingredient.name}
                </Text>
              ))}
            </div>
            
            <div style={{ marginTop: '16px' }}>
              <SectionTitle>Instructions</SectionTitle>
              {generatedRecipe.instructions?.map((instruction, index) => (
                <Text key={`instruction-${index}`} color="#555">
                  {typeof instruction === 'string'
                    ? instruction
                    : instruction.step}
                </Text>
              ))}
            </div>
          </div>
          
          {rawResponse && (
            <div style={{ marginTop: '24px' }}>
              <SectionTitle>Raw response</SectionTitle>
              <Pre>{JSON.stringify(rawResponse, null, 2)}</Pre>
            </div>
          )}
        </Card>
      )}
    </Container>
  );
};

export default App;
