import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface MarkdownContentProps {
  content: string;
}

const components: Components = {
  h1: ({ children }) => <h1 className="text-xl font-semibold text-heading mt-4 mb-2">{children}</h1>,
  h2: ({ children }) => <h2 className="text-lg font-semibold text-heading mt-3 mb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-semibold text-heading mt-3 mb-1">{children}</h3>,
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-heading">{children}</strong>,
  em: ({ children }) => <em className="italic text-body">{children}</em>,
  ul: ({ children }) => <ul className="list-disc ml-5 mb-3 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal ml-5 mb-3 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  code: ({ className, children }) => {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return (
        <code className="block bg-base rounded-lg px-4 py-3 text-sm font-mono text-body overflow-x-auto my-3">
          {children}
        </code>
      );
    }
    return (
      <code className="bg-active/50 text-heading px-1.5 py-0.5 rounded text-[0.85em] font-mono">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <pre className="mb-3">{children}</pre>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-aero-blue/50 pl-3 text-muted italic my-3">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-3">
      <table className="min-w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="text-left px-3 py-2 font-semibold text-heading border-b border-edge bg-raised/50">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 border-b border-edge">{children}</td>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-aero-blue-light hover:text-aero-blue underline underline-offset-2">
      {children}
    </a>
  ),
  hr: () => <hr className="border-edge my-4" />,
};

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
