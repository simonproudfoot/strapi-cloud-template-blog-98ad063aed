'use strict';

const React = require('react');
const {
  Layout,
  BaseHeaderLayout,
  ContentLayout,
  Stack,
  Box,
  Textarea,
  Grid,
  GridItem,
  TextInput,
  Button,
  Typography,
  Flex,
} = require('@strapi/design-system');
const { Play, Check } = require('@strapi/icons');
const { useNotification, request } = require('@strapi/helper-plugin');
const pluginId = require('../../pluginId');

const App = () => {
  const toggleNotification = useNotification();
  const [query, setQuery] = React.useState('');
  const [dietaryRequirements, setDietaryRequirements] = React.useState('');
  const [servingSize, setServingSize] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [generatedRecipe, setGeneratedRecipe] = React.useState(null);
  const [rawResponse, setRawResponse] = React.useState(null);

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
      setQuery('');
      setDietaryRequirements('');
      setServingSize('');
      toggleNotification({
        type: 'success',
        message: {
          id: `${pluginId}.notification.create-success`,
          defaultMessage: 'Recipe saved to Strapi.',
        },
      });
      if (typeof window !== 'undefined' && result?.recipe?.id) {
        // Use documentId if available (Strapi v4+), otherwise use id
        const documentId = result.recipe.documentId || result.recipe.id;
        const url = `/content-manager/collection-types/api::recipe.recipe/${documentId}`;
        // Try to navigate instead of opening in new tab to avoid 404
        window.location.href = url;
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

  return React.createElement(
    Layout,
    null,
    React.createElement(BaseHeaderLayout, {
      title: 'AI Recipe Generator',
      subtitle: 'Generate curated recipes with the live chat API and save them into Strapi.',
      as: 'h2',
    }),
    React.createElement(
      ContentLayout,
      null,
      React.createElement(
        Stack,
        { spacing: 6 },
        React.createElement(
          Box,
          { background: 'neutral0', padding: 6, shadow: 'filterShadow', hasRadius: true },
          React.createElement(
            Stack,
            { spacing: 4 },
            React.createElement(Textarea, {
              label: 'Prompt',
              name: 'query',
              placeholder: 'e.g. Give me a quick midweek chicken pasta',
              value: query,
              onChange: (e) => setQuery(e.target.value),
              required: true,
              minRows: 4,
            }),
            React.createElement(
              Grid,
              { gap: 4 },
              React.createElement(
                GridItem,
                { col: 6, s: 12 },
                React.createElement(TextInput, {
                  label: 'Dietary requirements',
                  name: 'dietaryRequirements',
                  placeholder: 'Optional – e.g. Vegetarian',
                  value: dietaryRequirements,
                  onChange: (e) => setDietaryRequirements(e.target.value),
                })
              ),
              React.createElement(
                GridItem,
                { col: 6, s: 12 },
                React.createElement(TextInput, {
                  label: 'Serving size',
                  name: 'servingSize',
                  placeholder: 'Optional – e.g. Serves 2',
                  value: servingSize,
                  onChange: (e) => setServingSize(e.target.value),
                })
              )
            ),
            React.createElement(
              Button,
              {
                onClick: handleGenerate,
                loading: isGenerating,
                startIcon: React.createElement(Play),
              },
              'Generate recipe'
            )
          )
        ),
        generatedRecipe &&
          React.createElement(
            Box,
            { background: 'neutral0', padding: 6, shadow: 'filterShadow', hasRadius: true },
            React.createElement(
              Stack,
              { spacing: 4 },
              React.createElement(
                Flex,
                { justifyContent: 'space-between', alignItems: 'center' },
                React.createElement(
                  Typography,
                  { variant: 'beta', fontWeight: 'bold' },
                  'Preview'
                ),
                React.createElement(
                  Button,
                  {
                    onClick: handleCreate,
                    loading: isSaving,
                    startIcon: React.createElement(Check),
                  },
                  'Save to Strapi'
                )
              ),
              React.createElement(
                Stack,
                { spacing: 3 },
                React.createElement(
                  Typography,
                  { variant: 'delta' },
                  generatedRecipe.name || generatedRecipe.title
                ),
                generatedRecipe.description &&
                  React.createElement(
                    Typography,
                    { textColor: 'neutral600' },
                    generatedRecipe.description
                  ),
                React.createElement(
                  Stack,
                  { spacing: 2 },
                  React.createElement(
                    Typography,
                    { variant: 'epsilon', fontWeight: 'bold' },
                    'Ingredients'
                  ),
                  React.createElement(
                    Stack,
                    { spacing: 1 },
                    generatedRecipe.ingredients?.map((ingredient, index) =>
                      React.createElement(
                        Typography,
                        {
                          key: `${ingredient.name}-${index}`,
                          textColor: 'neutral700',
                        },
                        `${ingredient.quantity ? `${ingredient.quantity} ` : ''}${ingredient.name}`
                      )
                    )
                  )
                ),
                React.createElement(
                  Stack,
                  { spacing: 2 },
                  React.createElement(
                    Typography,
                    { variant: 'epsilon', fontWeight: 'bold' },
                    'Instructions'
                  ),
                  React.createElement(
                    Stack,
                    { spacing: 1 },
                    generatedRecipe.instructions?.map((instruction, index) =>
                      React.createElement(
                        Typography,
                        {
                          key: `instruction-${index}`,
                          textColor: 'neutral700',
                        },
                        typeof instruction === 'string'
                          ? instruction
                          : instruction.step
                      )
                    )
                  )
                )
              ),
              rawResponse &&
                React.createElement(
                  Box,
                  {
                    background: 'neutral100',
                    padding: 4,
                    hasRadius: true,
                    style: { maxHeight: 320, overflow: 'auto' },
                  },
                  React.createElement(
                    Typography,
                    { variant: 'pi', fontWeight: 'bold' },
                    'Raw response'
                  ),
                  React.createElement(
                    Box,
                    {
                      as: 'pre',
                      marginTop: 2,
                      style: { whiteSpace: 'pre-wrap' },
                    },
                    JSON.stringify(rawResponse, null, 2)
                  )
                )
            )
          )
      )
    )
  );
};

module.exports = App;
module.exports.default = App;
