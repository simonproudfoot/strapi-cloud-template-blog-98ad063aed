"use strict";

module.exports = [
    {
        method: 'POST',
        path: '/generate',
        handler: 'openai-recipe.generate',
        config: {
            policies: ['admin::isAuthenticatedAdmin'],
        },
    },
    {
        method: 'POST',
        path: '/create',
        handler: 'openai-recipe.create',
        config: {
            policies: ['admin::isAuthenticatedAdmin'],
        },
    },
];



