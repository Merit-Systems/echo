const VEO_MODELS = [
  'veo-3.1-generate-preview',
  'veo-3.1-fast-generate-preview',
  'veo-generate-preview',
  'veo-fast-generate-preview',
];

function App() {
  const [model, setModel] = useState<string>('veo-3.1-generate-preview'); // Default model