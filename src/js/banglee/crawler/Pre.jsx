import SyntaxHighlighter from 'react-syntax-highlighter';
import a11yLight from 'react-syntax-highlighter/dist/esm/styles/hljs/a11y-light';
export default function Pre({ children }) {
  return (
    <SyntaxHighlighter language="json" style={a11yLight}>
      {children}
    </SyntaxHighlighter>
  );
};