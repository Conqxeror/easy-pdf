import Link from "next/link";

export default function ToolCard({ tool }) {
  return (
    <Link
      key={tool.href}
      href={tool.comingSoon ? "#" : tool.href}
      className={`group block p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-300 border border-gray-700 hover:border-blue-500 ${
        tool.comingSoon ? "opacity-70" : ""
      }`}
      aria-disabled={tool.comingSoon}
      tabIndex={tool.comingSoon ? -1 : 0}
    >
      <div className="flex items-center justify-center mb-4">
        {tool.icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-50 group-hover:text-blue-400 mb-2 text-center">
        {tool.title}
        {tool.comingSoon && (
          <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
            Coming Soon
          </span>
        )}
      </h3>
      <p className="text-gray-400 text-sm text-center">
        {tool.description}
      </p>
    </Link>
  );
}
