export default function load(image) {
	if (!image) {
		return Promise.reject();
	} else if (typeof image === 'string') {
		// If image is a string, "convert" it to an <img>
		const src = image;
		image = new Image();
		image.src = src;
	} else if (image.length !== undefined) {
		// If image is Array-like, wait for all to finish
		const reflected = [].map.call(image, img => load(img).then(
			img => [img, true],
			img => [img, false]
		));
		return Promise.all(reflected).then(results => {
			const images = {
				loaded: results.filter(x => x[1]).map(x => x[0])
			};
			if (images.loaded.length === results.length) {
				return images.loaded;
			}
			images.errored = results.filter(x => !x[1]).map(x => x[0]);
			throw images;
		});
	} else if (image.tagName !== 'IMG') {
		// If it's not an <img> tag, reject
		return Promise.reject();
	}

	const promise = new Promise((resolve, reject) => {
		if (image.naturalWidth) { // Truthy if loaded successfully
			resolve(image);
		} else if (image.complete) { // True if failed, at this point
			reject(image);
		} else {
			image.addEventListener('load', fullfill);
			image.addEventListener('error', fullfill);
		}
		function fullfill() {
			if (image.naturalWidth) {
				resolve(image);
			} else {
				reject(image);
			}
			image.removeEventListener('load', fullfill);
			image.removeEventListener('error', fullfill);
		}
	});
	promise.image = image;
	return promise;
}
