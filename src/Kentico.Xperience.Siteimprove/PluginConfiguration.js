// var is used here because the plugin needs access to this variable
var _si = window._si || [];

const HIGHLIGHT_CLASS = "siteimprove-content-check-highlight";
const HIGHLIGHT_SECONDS = 60; 
const HIGHLIGHT_COLOR = "#ffe066";

let cleanupFunction = null;
let cleanupTimeout = null;

const injectHighlightStyles = () => {
    document.head.insertAdjacentHTML('beforeend', `
        <style type="text/css">
          .${HIGHLIGHT_CLASS} {
            animation-name: highlight-outline;
            animation-duration: ${HIGHLIGHT_SECONDS}s;
            animation-fill-mode: forwards;
            outline: 3px solid ${HIGHLIGHT_COLOR};
            outline-offset: -3px;
          }

          @keyframes highlight-outline {
            0% {
              outline-color: ${HIGHLIGHT_COLOR};
            }
            90% {
              outline-color: ${HIGHLIGHT_COLOR};
            }
            100% {
              outline-color: transparent;
            }
          }
        </style>`
    );
};

const onHighlight = (highlight) => {
    highlight.highlights.forEach(highlight => {
        clearCleanup();

        if (highlight.selector.startsWith('head') || highlight.selector === 'html') {
            highlight.selector = 'body';
            highlight.offset = null;
        }

        const element = document.querySelector(highlight.selector);

        if (!element) {
            return;
        }

        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });

        if (highlight.offset) {
            const originalHTML = element.innerHTML;
            const childNode = element.childNodes[highlight.offset.child];
            const start = highlight.offset.start;
            const length = highlight.offset.length;

            const range = document.createRange();
            range.setStart(childNode, start);
            range.setEnd(childNode, start + length);

            const span = document.createElement('span');
            span.className = HIGHLIGHT_CLASS;

            range.surroundContents(span);

            cleanup(() => element.innerHTML = originalHTML);

        } else {
            element.classList.add(HIGHLIGHT_CLASS);
            cleanup(() => element.classList.remove(HIGHLIGHT_CLASS));
        }
    });
};

const cleanup = (func) => {
    cleanupFunction = func;
    cleanupTimeout = setTimeout(() => {
        func();
        cleanupFunction = null;
        cleanupTimeout = null;
    }, HIGHLIGHT_SECONDS * 1000);
};

const clearCleanup = () => {
    if (cleanupTimeout && cleanupFunction) {
        clearTimeout(cleanupTimeout);
        cleanupFunction();
        cleanupFunction = null;
        cleanupTimeout = null;
    }
};

const replaceButtonIcon = (button) => {
    const contentCheckIcon = button.querySelector('svg');
    button.removeChild(contentCheckIcon);
    button.insertAdjacentHTML('beforeend', `
        <svg
          width="28px"
          height="28px"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          author="Kentico"
        >
          <g
            clip-path="url(#clipboard-checklist_svg__a)"
            fill-rule="evenodd"
            clip-rule="evenodd"
            fill="currentColor"
          >
            <path d="M5.514.002a.5.5 0 0 0-.5.5v.5H2.5a.5.5 0 0 0-.5.5v14a.5.5 0 0 0 .5.5h10.996a.5.5 0 0 0 .5-.5v-14a.5.5 0 0 0-.5-.5h-2.48v-.5a.5.5 0 0 0-.5-.5H5.515Zm5.503 2v.5a.5.5 0 0 1-.5.5H5.514a.5.5 0 0 1-.5-.5v-.5H3v13h9.996v-13h-1.98Zm-1 0H6.014v-1h4.003v1Z" />
            <path d="M10.74 6.061a.5.5 0 0 1 .199.679l-3 5.5a.5.5 0 0 1-.846.05l-2-2.8a.5.5 0 1 1 .814-.58l1.536 2.15 2.618-4.8a.5.5 0 0 1 .678-.199Z" />
          </g>
          <defs>
            <clipPath id="clipboard-checklist_svg__a">
              <path fill="#fff" d="M0 0h16v16H0z" />
            </clipPath>
          </defs>
        </svg>`
    );
};

const setupContentCheckButton = (token, input, button) => {
    const title = 'Siteimprove Prepublish check';

    button.attributes.removeNamedItem('data-link');
    button.attributes.getNamedItem('aria-label').value = title;
    button.setAttribute('title', title);

    button.onclick = async () => {
        button.disabled = true;
        button.setAttribute('title', 'Please wait for the Siteimprove overlay to open.');
        _si.push(['contentcheck-flat-dom', document, input, token, () => { return; }]);
        setTimeout(() => {
            button.disabled = false;
            button.setAttribute('title', title);
        }, 6000);
    }

    replaceButtonIcon(button);
};

const injectContentCheck = (token, input) => {
    const container = document.querySelector('div[aria-label="Siteimprove CMS Plugin"] > .si-boxes-container');

    if (!container) {
        return false;
    }

    const topbox = container.querySelector('.si-topbox');

    if (!topbox) {
        return false;
    }

    const contentCheckBox = topbox.cloneNode(true);
    const contentCheckButton = contentCheckBox.querySelector('.si-button');

    if (!contentCheckButton) {
        return false;
    }

    setupContentCheckButton(token, input, contentCheckButton);
    container.appendChild(contentCheckBox);

    injectHighlightStyles();
    _si.push(['onHighlight', onHighlight]);

    return true;
};

const injectButtonTitles = () => {
    const container = document.querySelector('div[aria-label="Siteimprove CMS Plugin"] > .si-boxes-container');

    if (!container) {
        return false;
    }

    const buttons = container.querySelectorAll("button");

    const title = "Siteimprove Page & Site overview";

    buttons.forEach(button => {
        button.setAttribute('title', title);
    });

    return true;
}

((token, domain, input = null, contentCheck = false) => {
    _si.push(['domain', domain, token, () => { }]);

    if (input !== null) {
        _si.push(['input', input, token, , () => { }]);
    }

    // In case the plugin takes bit of a time to load and injects failed, try again several times.
    // It usually doesn't take more than 2 attempts.
    let attempts = 0;
    const maxAttempts = 25;
    let buttonTitlesInjected = false;
    let contentCheckInjected = false;
    const interval = setInterval(() => {
        if (attempts >= maxAttempts) {
            clearInterval(interval);
        }
        attempts++;
        if (!buttonTitlesInjected) {
            buttonTitlesInjected = injectButtonTitles();
        }

        if (contentCheck && !contentCheckInjected) {
            contentCheckInjected = injectContentCheck(token, input);
        }

        if (buttonTitlesInjected && (!contentCheck || contentCheckInjected)) {
            clearInterval(interval);
        }
    }, 800);
})