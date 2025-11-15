/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useState } from 'react';
import { createFromIconfontCN, parseIconsFromScript, waitForIconfontScript } from '@aipt/iconfont';

interface ParsedIcon {
  id: string;
  name: string;
  viewBox: string;
  content: string;
}

const OnlineDemo: React.FC = () => {
  const [iconfontUrl, setIconfontUrl] = useState(
    'https://at.alicdn.com/t/font_8d5l8fzk5b87iudi.js'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [icons, setIcons] = useState<ParsedIcon[]>([]);
  const [Iconfont, setIconfont] = useState<ReturnType<typeof createFromIconfontCN> | null>(null);
  const [copiedIcon, setCopiedIcon] = useState<string | null>(null);

  const handleLoad = async () => {
    if (!iconfontUrl.trim()) {
      setError('Please enter an iconfont URL');
      return;
    }

    setLoading(true);
    setError(null);
    setIcons([]);
    setIconfont(null);

    try {
      // First create Iconfont component to load the script
      const IconfontComponent = createFromIconfontCN({
        scriptUrl: iconfontUrl,
      });
      setIconfont(() => IconfontComponent);

      // Wait for script to load and get SVG string
      const svgString = await waitForIconfontScript(iconfontUrl, 10000);

      if (!svgString) {
        throw new Error('Could not extract SVG string from loaded script');
      }

      // Parse icons from SVG string
      const parsedIcons = parseIconsFromScript(svgString);
      setIcons(parsedIcons);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load iconfont');
      console.error('Error loading iconfont:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyIcon = async (iconName: string) => {
    const jsxCode = `<Iconfont type="${iconName}" className="text-2xl" />`;
    try {
      await navigator.clipboard.writeText(jsxCode);
      setCopiedIcon(iconName);
      setTimeout(() => setCopiedIcon(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = jsxCode;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedIcon(iconName);
        setTimeout(() => setCopiedIcon(null), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={iconfontUrl}
          onChange={(e) => setIconfontUrl(e.target.value)}
          placeholder="Enter iconfont URL..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleLoad}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Load Icons'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {icons.length > 0 && (
        <div>
          <p className="text-gray-600 mb-4">
            Found {icons.length} icons. Click on an icon to copy JSX code.
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-4">
            {icons.map((icon) => {
              const iconName = icon.id.replace(/^(pintu-)?icon-/, '');
              const isCopied = copiedIcon === iconName;
              return (
                <div
                  key={icon.id}
                  onClick={() => handleCopyIcon(iconName)}
                  className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all ${
                    isCopied
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:bg-gray-50 hover:border-blue-300'
                  }`}
                  title={`Click to copy: <Iconfont type="${iconName}" />`}
                >
                  {Iconfont && <Iconfont type={iconName} className="text-2xl text-gray-700 mb-2" />}
                  <span
                    className={`text-xs text-center truncate w-full ${
                      isCopied ? 'text-green-600 font-semibold' : 'text-gray-500'
                    }`}
                  >
                    {isCopied ? 'Copied!' : iconName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {Iconfont && icons.length > 0 && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Usage Example</h3>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <div className="mb-2">
              <span className="text-gray-400">import</span>{' '}
              <span className="text-blue-400">{'{'}</span>{' '}
              <span className="text-yellow-400">createFromIconfontCN</span>{' '}
              <span className="text-blue-400">{'}'}</span>{' '}
              <span className="text-gray-400">from</span>{' '}
              <span className="text-green-400">'@aipt/iconfont'</span>;
            </div>
            <div className="mb-2">
              <span className="text-gray-400">const</span>{' '}
              <span className="text-yellow-400">Iconfont</span>{' '}
              <span className="text-gray-400">=</span>{' '}
              <span className="text-yellow-400">createFromIconfontCN</span>
              <span className="text-blue-400">({'{'}</span>
            </div>
            <div className="ml-4 mb-2">
              <span className="text-purple-400">scriptUrl</span>
              <span className="text-gray-400">:</span>{' '}
              <span className="text-green-400">'{iconfontUrl}'</span>
            </div>
            <div className="mb-2">
              <span className="text-blue-400">{'});'}</span>
            </div>
            <div className="mt-4">
              <span className="text-gray-400">{'<'}</span>
              <span className="text-yellow-400">Iconfont</span>{' '}
              <span className="text-purple-400">type</span>
              <span className="text-gray-400">=</span>
              <span className="text-green-400">
                "{icons[0]?.id.replace(/^(pintu-)?icon-/, '')}"
              </span>{' '}
              <span className="text-purple-400">className</span>
              <span className="text-gray-400">=</span>
              <span className="text-green-400">"text-2xl"</span>{' '}
              <span className="text-gray-400">{'/>'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineDemo;
