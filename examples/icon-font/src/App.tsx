import { useState, useEffect } from 'react';
import GeneratedIcons from './components/GeneratedIcons';
import OnlineDemo from './components/OnlineDemo';

function App() {
  const [hasGeneratedIcons, setHasGeneratedIcons] = useState(false);

  useEffect(() => {
    // Check if generated icons exist
    try {
      // Try to import generated icons (this will fail if not generated)
      import('./icons')
        .then(() => {
          setHasGeneratedIcons(true);
        })
        .catch(() => {
          setHasGeneratedIcons(false);
        });
    } catch {
      setHasGeneratedIcons(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Iconfont Demo</h1>

        <div className="space-y-8">
          {/* Online Demo Section */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Online Demo</h2>
            <p className="text-gray-600 mb-4">
              Enter an iconfont URL to load and display icons dynamically.
            </p>
            <OnlineDemo />
          </section>

          {/* Generated Icons Section */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Generated Icons</h2>
            {hasGeneratedIcons ? (
              <GeneratedIcons />
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  No Generated Icons Found
                </h3>
                <p className="text-yellow-700 mb-4">
                  To generate icon components, run the following command:
                </p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm mb-4">
                  <div className="mb-2">
                    <span className="text-gray-400"># Single iconfont URL</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-green-400">pnpm</span>{' '}
                    <span className="text-blue-400">gen-icons</span>{' '}
                    <span className="text-yellow-400">
                      https://at.alicdn.com/t/font_8d5l8fzk5b87iudi.js
                    </span>
                  </div>
                  <div className="mt-4 mb-2">
                    <span className="text-gray-400"># Multiple iconfont URLs</span>
                  </div>
                  <div>
                    <span className="text-green-400">pnpm</span>{' '}
                    <span className="text-blue-400">gen-icons</span>{' '}
                    <span className="text-yellow-400">https://at.alicdn.com/t/c/font_1.js</span>{' '}
                    <span className="text-yellow-400">https://at.alicdn.com/t/c/font_2.js</span>
                  </div>
                </div>
                <div className="text-yellow-700">
                  <p className="mb-2">Options:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>
                      <code className="bg-yellow-100 px-1 rounded">-o, --output &lt;path&gt;</code>{' '}
                      Output directory (default: ./src/icons)
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;
