# Simple Icons Integration

This directory contains components for using Simple Icons in your React application.

## Components

### SimpleIcon

A basic wrapper for Simple Icons that renders SVG icons.

```tsx
import { SimpleIcon } from '@/components/ui/SimpleIcon';

// Basic usage
<SimpleIcon name="github" size={24} color="#333" />

// With custom styling
<SimpleIcon
  name="react"
  size={32}
  color="#61dafb"
  className="hover:scale-110 transition-transform"
/>
```

### OrganizationIcon

A specialized component that automatically maps organization names to their Simple Icons.

```tsx
import { OrganizationIcon } from '@/components/ui/OrganizationIcon';

// Automatically finds the right icon for the organization
<OrganizationIcon orgName="Amazon" size={24} />

// With fallback for unknown organizations
<OrganizationIcon
  orgName="Unknown Company"
  fallback={<span>🏢</span>}
/>
```

## Usage Examples

### In ExperienceItem

```tsx
import { OrganizationIcon } from "@/components/ui/OrganizationIcon";

// Add this to your ExperienceItem component
<div className="flex items-center gap-3">
	<OrganizationIcon orgName={experience.org} size={20} color="currentColor" />
	<div className="text-xl font-semibold">{experience.org}</div>
</div>;
```

### In ProjectCard

```tsx
import { SimpleIcon } from "@/components/ui/SimpleIcon";

// For tech stack icons
<div className="flex gap-2">
	{tech.map((techName) => (
		<SimpleIcon
			key={techName}
			name={techName.toLowerCase()}
			size={16}
			title={techName}
		/>
	))}
</div>;
```

## Available Icons

Simple Icons has over 2000+ brand icons. Common ones include:

-   **Tech Companies**: amazon, google, microsoft, apple, meta, netflix
-   **Social Media**: github, twitter, linkedin, instagram, discord
-   **Cloud Services**: aws, azure, gcp, vercel, netlify
-   **Frameworks**: react, vue, angular, nodejs, python, java
-   **Tools**: docker, kubernetes, postgresql, mongodb, redis

## Finding Icon Names

Use the helper functions to find available icons:

```tsx
import { getAvailableIconNames, searchIcons } from "@/components/ui/SimpleIcon";

// Get all available icon names
const allIcons = getAvailableIconNames();

// Search for specific icons
const searchResults = searchIcons("amazon"); // Returns: ['amazon', 'amazonaws']
```

## Benefits over Lucide React

1. **Brand Recognition**: Official brand logos instead of generic icons
2. **Comprehensive Coverage**: 2000+ icons vs ~300 in Lucide
3. **Professional Look**: Company logos make experiences more recognizable
4. **Consistent Branding**: Official colors and shapes for each company
5. **Better UX**: Users immediately recognize familiar company logos

## Migration from Lucide

Replace Lucide icons with Simple Icons:

```tsx
// Before (Lucide)
import { Building } from 'lucide-react';
<Building className="w-5 h-5" />

// After (Simple Icons)
<OrganizationIcon orgName="Company Name" size={20} />
```
