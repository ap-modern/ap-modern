import React, { useState, useEffect } from 'react';

interface IconModule {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: React.ComponentType<any>;
}

const GeneratedIcons: React.FC = () => {
  const [icons, setIcons] = useState<IconModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedIcon, setCopiedIcon] = useState<string | null>(null);

  useEffect(() => {
    const loadIcons = async () => {
      try {
        const iconModule = await import('../icons');
        setIcons(iconModule as IconModule);
      } catch (err) {
        setError('Failed to load generated icons. Please run gen-icons command.');
        console.error('Error loading icons:', err);
      } finally {
        setLoading(false);
      }
    };

    void loadIcons();
  }, []);

  const handleCopyIcon = async (iconName: string) => {
    const jsxCode = `<${iconName} className="text-2xl" />`;
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

  if (loading) {
    return <div className="text-gray-600">Loading generated icons...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!icons) {
    return <div className="text-gray-600">No icons found. Please run gen-icons command.</div>;
  }

  const iconNames = Object.keys(icons).filter((name) => name !== 'default' && name !== 'BaseIcon');

  if (iconNames.length === 0) {
    return (
      <div className="text-gray-600">
        No icon components found. Please run gen-icons command with valid iconfont URLs.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-600">Found {iconNames.length} generated icon components.</p>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-4">
        {iconNames.map((iconName) => {
          const IconComponent = icons[iconName];
          const isCopied = copiedIcon === iconName;
          return (
            <div
              key={iconName}
              onClick={() => void handleCopyIcon(iconName)}
              className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all ${
                isCopied
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:bg-gray-50 hover:border-blue-300'
              }`}
              title={`Click to copy: <${iconName} />`}
            >
              <IconComponent className="text-2xl text-gray-700 mb-2" />
              <span
                className={`text-xs text-center truncate w-full ${
                  isCopied ? 'text-green-600 font-semibold' : 'text-gray-500'
                }`}
              >
                {isCopied ? 'Copied!' : iconName.replace('Icon', '')}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Usage Example</h3>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
          <div className="mb-2">
            <span className="text-gray-400">import</span>{' '}
            <span className="text-blue-400">{'{'}</span>{' '}
            <span className="text-yellow-400">{iconNames[0]}</span>{' '}
            <span className="text-blue-400">{'}'}</span> <span className="text-gray-400">from</span>{' '}
            <span className="text-green-400">'./icons'</span>;
          </div>
          <div className="mt-4">
            <span className="text-gray-400">{'<'}</span>
            <span className="text-yellow-400">{iconNames[0]}</span>{' '}
            <span className="text-purple-400">className</span>
            <span className="text-gray-400">=</span>
            <span className="text-green-400">"text-2xl text-blue-600"</span>{' '}
            <span className="text-gray-400">{'/>'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedIcons;
