// Image cache utility for GitHub hosted images
class ImageCache {
	private cache = new Map<string, Promise<string>>();
	private preloadedImages = new Set<string>();

	// Preload an image and store it in cache
	preloadImage(url: string): Promise<string> {
		if (this.cache.has(url)) {
			return this.cache.get(url)!;
		}

		const promise = new Promise<string>((resolve, reject) => {
			const img = new Image();

			img.onload = () => {
				this.preloadedImages.add(url);
				resolve(url);
			};

			img.onerror = () => {
				this.cache.delete(url);
				reject(new Error(`Failed to load image: ${url}`));
			};

			img.src = url;
		});

		this.cache.set(url, promise);
		return promise;
	}

	// Preload multiple images
	async preloadImages(urls: string[]): Promise<void> {
		const promises = urls.map((url) =>
			this.preloadImage(url).catch(() => {
				// Silently ignore failed images
				console.warn(`Failed to preload image: ${url}`);
			})
		);

		await Promise.allSettled(promises);
	}

	// Check if an image is cached
	isImageCached(url: string): boolean {
		return this.preloadedImages.has(url);
	}

	// Clear cache
	clearCache(): void {
		this.cache.clear();
		this.preloadedImages.clear();
	}

	// Get cache size
	getCacheSize(): number {
		return this.preloadedImages.size;
	}
}

// Create a singleton instance
export const imageCache = new ImageCache();

// Utility function to preload GitHub images from gallery data
export async function preloadGitHubImages(
	galleries: Array<{ url: string; original_url: string }[]>
): Promise<void> {
	const githubUrls: string[] = [];

	galleries.forEach((gallery) => {
		gallery.forEach((image) => {
			// Only cache GitHub hosted images
			if (
				image.url.includes("github.com") ||
				image.original_url.includes("github.com")
			) {
				githubUrls.push(image.url);
			}
		});
	});

	if (githubUrls.length > 0) {
		console.log(`Preloading ${githubUrls.length} GitHub images...`);
		await imageCache.preloadImages(githubUrls);
		console.log(`Successfully cached ${imageCache.getCacheSize()} images`);
	}
}
