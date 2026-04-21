import Link from 'next/link';

interface BreadcrumbProps {
  countryCode: string;
  categoryId?: string;
  categoryName?: string;
  current: string;
}

export default function Breadcrumb({ countryCode, categoryId, categoryName, current }: BreadcrumbProps) {
  const items = [
    { label: 'Home', href: `/${countryCode}` },
    { label: 'Categories', href: `/${countryCode}/categories` },
  ];

  if (categoryId && categoryName) {
    items.push({ label: categoryName, href: `/${countryCode}/categories/${categoryId}` });
  }

  if (current) {
    items.push({ label: current, href: '#' });
  }

  return (
    <nav className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-gray-600">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <span className="mx-2">/</span>}
            {index === items.length - 1 ? (
              <span className="font-medium text-gray-900">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-[#b84c4c] transition-colors">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}