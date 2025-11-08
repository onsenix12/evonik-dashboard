/**
 * Shared Utilities for Evonik Dashboard
 * Contains common functions used across multiple pages
 */

// Role to Title Mapping
const ROLE_TITLES = {
    'supply_chain': {
        'local': 'Local Supply Chain Manager',
        'global': 'Global Supply Chain Director'
    },
    'plant_manager': 'Production Manager',
    'sales': 'Regional Sales Manager',
    'operations': 'Production Manager',
    'management': 'Management'
};

// Constants
const CONSTANTS = {
    ALERT_TIMEOUT: 8000,
    COORDINATION_EVENT_KEY: 'evonik_coordination_event',
    USER_SESSION_KEY: 'evonik_user_session',
    EVENT_CLEANUP_DELAY: 5000,
    FRESH_LOGIN_THRESHOLD: 5 // seconds
};

/**
 * Update user display from localStorage session
 * @param {Object} options - Configuration options
 * @param {string} options.userNameId - ID of element to display user name
 * @param {string} options.userTitleId - ID of element to display user title
 * @param {string} options.roleContext - Context for role (e.g., 'local' or 'global' for supply_chain)
 */
function updateUserDisplay(options = {}) {
    const {
        userNameId = 'userName',
        userTitleId = 'userTitle',
        roleContext = null
    } = options;

    const userSession = localStorage.getItem(CONSTANTS.USER_SESSION_KEY);
    if (!userSession) {
        return;
    }

    try {
        const session = JSON.parse(userSession);
        const userNameEl = document.getElementById(userNameId);
        const userTitleEl = document.getElementById(userTitleId);

        if (userNameEl) {
            userNameEl.textContent = session.name;
        }

        if (userTitleEl) {
            let title = 'User';
            const role = session.role;

            if (role === 'supply_chain' && roleContext) {
                title = ROLE_TITLES[role][roleContext] || ROLE_TITLES[role]['local'];
            } else if (ROLE_TITLES[role]) {
                title = typeof ROLE_TITLES[role] === 'string' 
                    ? ROLE_TITLES[role] 
                    : ROLE_TITLES[role]['local'];
            }

            userTitleEl.textContent = title;
        }
    } catch (error) {
        console.error('Error parsing user session:', error);
    }
}

/**
 * Show alert banner
 * @param {string} message - Alert message
 * @param {string} bannerId - ID of alert banner element
 * @param {string} messageId - ID of message element
 * @param {number} timeout - Timeout in milliseconds (default: 8000)
 */
function showAlert(message, bannerId = 'alertsBanner', messageId = 'alertMessage', timeout = CONSTANTS.ALERT_TIMEOUT) {
    const banner = document.getElementById(bannerId);
    const messageEl = document.getElementById(messageId);

    if (!banner || !messageEl) {
        return;
    }

    messageEl.textContent = message;
    banner.classList.add('show');

    if (timeout > 0) {
        setTimeout(() => {
            banner.classList.remove('show');
        }, timeout);
    }
}

/**
 * Close alert banner
 * @param {string} bannerId - ID of alert banner element
 */
function closeAlert(bannerId = 'alertsBanner') {
    const banner = document.getElementById(bannerId);
    if (banner) {
        banner.classList.remove('show');
    }
}

/**
 * Broadcast coordination event to other pages via localStorage
 * @param {Object} event - Event object with type, data, timestamp, source
 * @param {number} cleanupDelay - Delay before removing event (default: 5000ms)
 */
function broadcastEvent(event, cleanupDelay = CONSTANTS.EVENT_CLEANUP_DELAY) {
    event.demo_trigger = true;
    localStorage.setItem(CONSTANTS.COORDINATION_EVENT_KEY, JSON.stringify(event));
    
    if (cleanupDelay > 0) {
        setTimeout(() => {
            localStorage.removeItem(CONSTANTS.COORDINATION_EVENT_KEY);
        }, cleanupDelay);
    }
}

/**
 * Initialize coordination event listener
 * @param {Function} handler - Event handler function
 */
function initCoordinationEventListener(handler) {
    window.addEventListener('storage', function(e) {
        if (e.key === CONSTANTS.COORDINATION_EVENT_KEY && e.newValue) {
            try {
                const eventData = JSON.parse(e.newValue);
                handler(eventData);
            } catch (error) {
                console.error('Error parsing coordination event:', error);
            }
        }
    });
}

/**
 * Check if user session exists and is valid
 * @returns {Object|null} - Session object or null
 */
function getUserSession() {
    const userSession = localStorage.getItem(CONSTANTS.USER_SESSION_KEY);
    if (!userSession) {
        return null;
    }

    try {
        return JSON.parse(userSession);
    } catch (error) {
        console.error('Error parsing user session:', error);
        localStorage.removeItem(CONSTANTS.USER_SESSION_KEY);
        return null;
    }
}

/**
 * Check if login is fresh (within threshold)
 * @param {Object} session - User session object
 * @returns {boolean} - True if login is fresh
 */
function isFreshLogin(session) {
    if (!session || !session.loginTime) {
        return false;
    }

    const loginTime = new Date(session.loginTime);
    const now = new Date();
    const secondsSinceLogin = (now - loginTime) / 1000;
    
    return secondsSinceLogin < CONSTANTS.FRESH_LOGIN_THRESHOLD;
}

/**
 * Redirect to role-specific dashboard
 * @param {string} role - User role
 */
function redirectToRoleDashboard(role) {
    const roleDashboardMap = {
        'supply_chain': 'local-supply-chain-new.html',
        'plant_manager': 'production-new.html',
        'sales': 'sales-new.html',
        'operations': 'production-new.html',
        'management': 'index-new.html'
    };

    const dashboard = roleDashboardMap[role];
    if (dashboard && dashboard !== 'index-new.html') {
        window.location.href = dashboard;
    }
}

/**
 * Initialize user session and handle redirects
 * @param {Object} options - Configuration options
 * @param {boolean} options.allowRedirect - Whether to allow role-based redirects
 * @param {Function} options.onSessionLoaded - Callback when session is loaded
 */
function initializeUserSession(options = {}) {
    const {
        allowRedirect = true,
        onSessionLoaded = null
    } = options;

    const session = getUserSession();
    
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    // Check for fresh login redirect
    if (allowRedirect && isFreshLogin(session) && session.role !== 'management') {
        redirectToRoleDashboard(session.role);
        return;
    }

    // Call callback if provided
    if (onSessionLoaded) {
        onSessionLoaded(session);
    }

    return session;
}

/**
 * Apply role-based access control to navigation
 * @param {Object} session - User session object
 * @param {string} navSelector - CSS selector for navigation items
 */
function applyRoleBasedAccess(session, navSelector = '.stakeholder-btn') {
    if (!session || !session.permissions) {
        return;
    }

    const permissions = session.permissions;
    const navItems = document.querySelectorAll(navSelector);

    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href) {
            let dashboard = href.replace('-new.html', '').replace('.html', '');

            const dashboardMapping = {
                'global-supply-chain': 'global-sc',
                'local-supply-chain': 'local-sc',
                'optimizer': 'optimizer',
                'sales': 'sales',
                'production': 'production',
                'index-new': 'hub'
            };

            dashboard = dashboardMapping[dashboard] || dashboard;

            if (!permissions.dashboards.includes(dashboard)) {
                item.style.display = 'none';
            }
        }
    });
}

/**
 * Safe DOM element getter with error handling
 * @param {string} id - Element ID
 * @param {string} errorMessage - Custom error message
 * @returns {HTMLElement|null} - Element or null
 */
function getElementSafely(id, errorMessage = null) {
    const element = document.getElementById(id);
    if (!element && errorMessage) {
        console.error(errorMessage);
    }
    return element;
}

/**
 * Update element text content safely
 * @param {string} id - Element ID
 * @param {string} text - Text content
 */
function updateElementText(id, text) {
    const element = getElementSafely(id);
    if (element) {
        element.textContent = text;
    }
}

/**
 * Update element class safely
 * @param {string} id - Element ID
 * @param {string} className - Class name to add/remove, or full className to set
 * @param {boolean} add - True to add, false to remove. If null/undefined, sets className directly
 */
function updateElementClass(id, className, add = true) {
    const element = getElementSafely(id);
    if (!element) return;
    
    if (add === null || add === undefined) {
        // Set className directly (replace all classes)
        element.className = className;
    } else if (add) {
        // Add class(es) - handle space-separated classes
        className.split(' ').forEach(cls => {
            if (cls.trim()) element.classList.add(cls.trim());
        });
    } else {
        // Remove class(es) - handle space-separated classes
        className.split(' ').forEach(cls => {
            if (cls.trim()) element.classList.remove(cls.trim());
        });
    }
}

/**
 * Set element className directly (replaces all classes)
 * @param {string} id - Element ID
 * @param {string} className - Full className to set
 */
function setElementClassName(id, className) {
    updateElementClass(id, className, null);
}

/**
 * Safely parse JSON from localStorage
 * @param {string} key - localStorage key
 * @param {*} defaultValue - Default value to return if parsing fails
 * @returns {*} - Parsed value or default value
 */
function safeParseLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        if (!item) {
            return defaultValue;
        }
        return JSON.parse(item);
    } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error);
        // Remove corrupted data
        try {
            localStorage.removeItem(key);
        } catch (removeError) {
            console.error(`Error removing corrupted localStorage key "${key}":`, removeError);
        }
        return defaultValue;
    }
}

/**
 * Safely parse JSON string
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value to return if parsing fails
 * @returns {*} - Parsed value or default value
 */
function safeParseJSON(jsonString, defaultValue = null) {
    if (!jsonString || typeof jsonString !== 'string') {
        return defaultValue;
    }
    
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return defaultValue;
    }
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateUserDisplay,
        showAlert,
        closeAlert,
        broadcastEvent,
        initCoordinationEventListener,
        getUserSession,
        isFreshLogin,
        redirectToRoleDashboard,
        initializeUserSession,
        applyRoleBasedAccess,
        getElementSafely,
        updateElementText,
        updateElementClass,
        setElementClassName,
        safeParseLocalStorage,
        safeParseJSON,
        CONSTANTS,
        ROLE_TITLES
    };
}

