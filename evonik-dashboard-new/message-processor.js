/**
 * Message Processor Module for Optimizer Chat
 * Breaks down the large processMessage() function into smaller, focused functions
 */

// Constants for message processing
const MESSAGE_DELAYS = {
    TYPING_INDICATOR: 1500,
    SCENARIO_COMPARISON: 1500
};

/**
 * Check if message matches any of the given keywords
 * @param {string} message - Lowercase message
 * @param {Array<string>} keywords - Array of keywords to check
 * @returns {boolean} - True if message contains any keyword
 */
function matchesKeywords(message, keywords) {
    return keywords.some(keyword => message.includes(keyword));
}

/**
 * Handle crisis-specific message queries
 * @param {string} message - Lowercase message
 * @param {Object} handlers - Object containing handler functions
 * @param {Object} state - Current state object (crisisTriggered, shownSections)
 * @returns {boolean} - True if message was handled
 */
function handleCrisisMessage(message, handlers, state) {
    if (!state.crisisTriggered) return false;

    // Methodology questions
    if (message.includes('how') && matchesKeywords(message, ['estimate', 'calculated', 'downtime', 'methodology'])) {
        handlers.showScenarioAMethodology();
        return true;
    }

    // Update/validation requests
    if (matchesKeywords(message, ['update', 'revise', 'validate', 'correction', 'actual'])) {
        handlers.showValidationForm();
        return true;
    }

    // Equipment status
    if (matchesKeywords(message, ['equipment', 'criticality', 'status'])) {
        handlers.showEquipmentStatus();
        return true;
    }

    // Scenario B
    if (matchesKeywords(message, ['scenario b', 'option b', 'second option'])) {
        handlers.showScenarioB();
        return true;
    }

    // Scenario C
    if (matchesKeywords(message, ['scenario c', 'option c', 'third option', 'other option'])) {
        handlers.showScenarioC();
        return true;
    }

    // Compare scenarios
    if (matchesKeywords(message, ['compare', 'all scenario', 'other option'])) {
        if (!state.shownSections.scenarioB) handlers.showScenarioB();
        setTimeout(() => {
            if (!state.shownSections.scenarioC) handlers.showScenarioC();
        }, MESSAGE_DELAYS.SCENARIO_COMPARISON);
        return true;
    }

    return false;
}

/**
 * Handle general data queries (production, inventory, cost)
 * @param {string} message - Lowercase message
 * @param {Object} handlers - Object containing handler functions
 * @returns {boolean} - True if message was handled
 */
function handleGeneralQuery(message, handlers) {
    if (matchesKeywords(message, ['production', 'status', 'output'])) {
        handlers.showProductionStatus();
        return true;
    }

    if (matchesKeywords(message, ['tank', 'inventory', 'stock', 'level'])) {
        handlers.showTankLevels();
        return true;
    }

    if (matchesKeywords(message, ['cost', 'price', 'expense'])) {
        handlers.showCostAnalysis();
        return true;
    }

    return false;
}

/**
 * Handle scenario/option queries
 * @param {string} message - Lowercase message
 * @param {Object} handlers - Object containing handler functions
 * @param {Object} state - Current state object
 * @returns {boolean} - True if message was handled
 */
function handleScenarioQuery(message, handlers, state) {
    const scenarioKeywords = ['option', 'scenario', 'what should', 'recommend', 'show scenario', 'recommendation'];
    const isScenarioQuery = matchesKeywords(message, scenarioKeywords) || 
                           (message === 'yes' && state.crisisTriggered);

    if (!isScenarioQuery) return false;

    if (state.crisisTriggered && !state.shownSections.scenarioA) {
        handlers.showScenarios();
    } else if (state.crisisTriggered && state.shownSections.scenarioA) {
        handlers.addSystemMessage('I\'ve already shown you Scenario A. Would you like to see other options? Say "show scenario B" or "compare all scenarios".');
    } else {
        handlers.showScenarios();
    }
    return true;
}

/**
 * Handle explainability queries
 * @param {string} message - Lowercase message
 * @param {Object} handlers - Object containing handler functions
 * @returns {boolean} - True if message was handled
 */
function handleExplainabilityQuery(message, handlers) {
    if (matchesKeywords(message, ['why', 'explain', 'reason'])) {
        handlers.showExplainability();
        return true;
    }
    return false;
}

/**
 * Get default fallback message based on crisis state
 * @param {boolean} crisisTriggered - Whether crisis is active
 * @returns {string} - Default message
 */
function getDefaultMessage(crisisTriggered) {
    if (crisisTriggered) {
        return 'I can provide more details about the recommendation. Ask me about: "How did you estimate the downtime?", "Show equipment status", "Update the estimate", or "Compare with other scenarios".';
    }
    return 'I can help you with: production status, tank levels, cost analysis, and optimization scenarios. What would you like to explore?';
}

/**
 * Process user message and route to appropriate handler
 * @param {string} message - User message
 * @param {Object} handlers - Object containing handler functions
 * @param {Object} state - Current state object
 */
function processMessage(message, handlers, state) {
    const lowerMsg = message.toLowerCase();

    // Try crisis-specific handlers first
    if (handleCrisisMessage(lowerMsg, handlers, state)) {
        return;
    }

    // Try general queries
    if (handleGeneralQuery(lowerMsg, handlers)) {
        return;
    }

    // Try scenario queries
    if (handleScenarioQuery(lowerMsg, handlers, state)) {
        return;
    }

    // Try explainability queries
    if (handleExplainabilityQuery(lowerMsg, handlers)) {
        return;
    }

    // Default fallback
    handlers.addSystemMessage(getDefaultMessage(state.crisisTriggered));
}

// Export functions for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        processMessage,
        handleCrisisMessage,
        handleGeneralQuery,
        handleScenarioQuery,
        handleExplainabilityQuery,
        matchesKeywords,
        MESSAGE_DELAYS
    };
}

// Also attach to window for browser use
if (typeof window !== 'undefined') {
    window.processMessageModule = processMessage;
    window.messageProcessor = {
        processMessage,
        handleCrisisMessage,
        handleGeneralQuery,
        handleScenarioQuery,
        handleExplainabilityQuery,
        matchesKeywords,
        MESSAGE_DELAYS
    };
}

