import React, { useState } from 'react';
import {
  Stack,
  Box,
  Textarea,
  Grid,
  GridItem,
  TextInput,
  Button,
  Typography,
  Flex,
} from '@strapi/design-system';
import { Play, Check } from '@strapi/icons';
import { useNotification } from '@strapi/strapi/admin';

import pluginId from '../../pluginId.js';

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
    <div>
      <Stack spacing={6}>
          <Box background="neutral0" padding={6} shadow="filterShadow" hasRadius>
            <Stack spacing={4}>
              <Textarea
                label="Prompt"
                name="query"
                placeholder="e.g. Give me a quick midweek chicken pasta"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
                minRows={4}
              />
              <Grid gap={4}>
                <GridItem col={6} s={12}>
                  <TextInput
                    label="Dietary requirements"
                    name="dietaryRequirements"
                    placeholder="Optional – e.g. Vegetarian"
                    value={dietaryRequirements}
                    onChange={(e) => setDietaryRequirements(e.target.value)}
                  />
                </GridItem>
                <GridItem col={6} s={12}>
                  <TextInput
                    label="Serving size"
                    name="servingSize"
                    placeholder="Optional – e.g. Serves 2"
                    value={servingSize}
                    onChange={(e) => setServingSize(e.target.value)}
                  />
                </GridItem>
              </Grid>
              <Button
                onClick={handleGenerate}
                loading={isGenerating}
                startIcon={<Play />}
              >
                Generate recipe
              </Button>
            </Stack>
          </Box>

          {generatedRecipe && (
            <Box background="neutral0" padding={6} shadow="filterShadow" hasRadius>
              <Stack spacing={4}>
                <Flex justifyContent="space-between" alignItems="center">
                  <Typography variant="beta" fontWeight="bold">
                    Preview
                  </Typography>
                  <Button
                    onClick={handleCreate}
                    loading={isSaving}
                    startIcon={<Check />}
                  >
                    Save to Strapi
                  </Button>
                </Flex>
                <Stack spacing={3}>
                  <Typography variant="delta">
                    {generatedRecipe.name || generatedRecipe.title}
                  </Typography>
                  {generatedRecipe.description && (
                    <Typography textColor="neutral600">
                      {generatedRecipe.description}
                    </Typography>
                  )}
                  <Stack spacing={2}>
                    <Typography variant="epsilon" fontWeight="bold">
                      Ingredients
                    </Typography>
                    <Stack spacing={1}>
                      {generatedRecipe.ingredients?.map((ingredient, index) => (
                        <Typography
                          key={`${ingredient.name}-${index}`}
                          textColor="neutral700"
                        >
                          {ingredient.quantity ? `${ingredient.quantity} ` : ''}
                          {ingredient.name}
                        </Typography>
                      ))}
                    </Stack>
                  </Stack>
                  <Stack spacing={2}>
                    <Typography variant="epsilon" fontWeight="bold">
                      Instructions
                    </Typography>
                    <Stack spacing={1}>
                      {generatedRecipe.instructions?.map((instruction, index) => (
                        <Typography
                          key={`instruction-${index}`}
                          textColor="neutral700"
                        >
                          {typeof instruction === 'string'
                            ? instruction
                            : instruction.step}
                        </Typography>
                      ))}
                    </Stack>
                  </Stack>
                </Stack>
                {rawResponse && (
                  <Box
                    background="neutral100"
                    padding={4}
                    hasRadius
                    style={{ maxHeight: 320, overflow: 'auto' }}
                  >
                    <Typography variant="pi" fontWeight="bold">
                      Raw response
                    </Typography>
                    <Box as="pre" marginTop={2} style={{ whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(rawResponse, null, 2)}
                    </Box>
                  </Box>
                )}
              </Stack>
            </Box>
          )}
      </Stack>
    </div>
  );
};

export default App;
