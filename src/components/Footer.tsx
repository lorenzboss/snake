const CREDITS = [
  { name: "lorenz", url: "https://github.com/lorenzboss" },
  { name: "leandro", url: "https://github.com/leandroaebi" },
  { name: "josh", url: "https://github.com/jokudev" },
  { name: "simon", url: "https://github.com/simiAtschool" },
];

export default function Footer() {
  return (
    <footer className="relative p-2 text-center text-sm text-gray-500 dark:text-gray-400">
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
        <span>Credits: </span>
        {CREDITS.map(({ name, url }) => (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-secondary"
          >
            {name}
          </a>
        ))}
      </div>
    </footer>
  );
}
