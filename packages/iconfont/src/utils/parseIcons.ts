/**
 * Parse icon symbols from iconfont script content
 */
export interface ParsedIcon {
  id: string;
  name: string;
  viewBox: string;
  content: string;
}

const symbolExpReg =
  /<(symbol) id="(pintu-)?icon-([^"]+)" viewBox="0 0 1024 1024">((?:(?!<\/\1>).|\n)*?)<\/\1>/g;

export function parseIconsFromScript(scriptContent: string): ParsedIcon[] {
  const icons: ParsedIcon[] = [];
  let match = symbolExpReg.exec(scriptContent);

  while (match) {
    const id = match[2] ? `pintu-icon-${match[3]}` : `icon-${match[3]}`;
    const name = match[3];
    const viewBox = '0 0 1024 1024';
    const content = match[4];

    icons.push({
      id,
      name,
      viewBox,
      content,
    });

    match = symbolExpReg.exec(scriptContent);
  }

  return icons;
}

/**
 * Fetch iconfont script content
 */
export async function fetchIconfontScript(iconfontUrl: string): Promise<string> {
  const response = await fetch(iconfontUrl, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch iconfont: ${response.statusText}`);
  }
  return response.text();
}

/**
 * Extract SVG string from script content
 */
export function extractSvgString(scriptContent: string): string | null {
  // Match window._iconfont_svg_string_XXXXX='<svg>...</svg>'
  const match = scriptContent.match(/window\._iconfont_svg_string_\d+='(<svg>.*?<\/svg>)'/);
  return match ? match[1] : null;
}

/**
 * Get SVG string from window object after script loads
 * This is used when script is loaded via <script> tag
 */
export function getSvgStringFromWindow(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  // Find window._iconfont_svg_string_* property
  for (const key in window) {
    if (key.startsWith('_iconfont_svg_string_')) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const svgString = (window as any)[key];
      if (typeof svgString === 'string') {
        return svgString;
      }
    }
  }

  // Alternative: try to get from DOM
  // iconfont scripts insert SVG into document.body
  const svgElements = document.querySelectorAll('svg[style*="position: absolute"]');
  if (svgElements.length > 0) {
    // Get the last inserted SVG (most recent)
    const lastSvg = svgElements[svgElements.length - 1];
    return lastSvg.outerHTML;
  }

  return null;
}

/**
 * Wait for script to load and get SVG string
 */
export function waitForIconfontScript(scriptUrl: string, timeout: number = 10000): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    const existingSvg = getSvgStringFromWindow();
    if (existingSvg) {
      resolve(existingSvg);
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector(
      `script[src="${scriptUrl}"]`
    ) as HTMLScriptElement;
    if (existingScript) {
      // Script exists, wait for it to load
      if (existingScript.onload) {
        existingScript.onload = () => {
          const svg = getSvgStringFromWindow();
          if (svg) {
            resolve(svg);
          } else {
            reject(new Error('Failed to get SVG string from loaded script'));
          }
        };
      } else {
        // Already loaded, try to get SVG
        setTimeout(() => {
          const svg = getSvgStringFromWindow();
          if (svg) {
            resolve(svg);
          } else {
            reject(new Error('Failed to get SVG string from loaded script'));
          }
        }, 100);
      }
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.setAttribute('data-namespace', scriptUrl);

    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout waiting for iconfont script to load'));
    }, timeout);

    script.onload = () => {
      clearTimeout(timeoutId);
      // Wait a bit for script to execute and set window property
      setTimeout(() => {
        const svg = getSvgStringFromWindow();
        if (svg) {
          resolve(svg);
        } else {
          reject(new Error('Failed to get SVG string from loaded script'));
        }
      }, 100);
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error(`Failed to load script: ${scriptUrl}`));
    };

    document.body.appendChild(script);
  });
}
