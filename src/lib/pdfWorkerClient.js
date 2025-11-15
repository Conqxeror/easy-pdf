// Client wrapper for the PDF processing web worker. Creates a worker, sends tasks,
// and returns a Promise which resolves with the returned buffer.

const workers = new Map();

export function getPdfWorker() {
	if (typeof window === 'undefined') return null;
	if (workers.has('pdf')) return workers.get('pdf');
	const worker = new Worker(new URL('./workers/pdfProcessor.worker.js', import.meta.url), { type: 'module' });
	workers.set('pdf', worker);
	return worker;
}

export async function processPdfInWorker({ action, file, files, options = {}, fileName }) {
	const worker = getPdfWorker();
	if (!worker) throw new Error('Workers not available in this environment');

	return new Promise(async (resolve, reject) => {
		const id = Math.random().toString(36).slice(2);

		const msgHandler = (ev) => {
			const { id: resId, result, error } = ev.data || {};
			if (resId !== id) return;
			worker.removeEventListener('message', msgHandler);
			if (error) return reject(new Error(error));
			return resolve(result);
		};

		worker.addEventListener('message', msgHandler);

		try {
			if (files && files.length) {
				const buffers = [];
				for (const f of files) {
					buffers.push(await f.arrayBuffer());
				}
				worker.postMessage({ id, action, filesBuffers: buffers, options }, buffers);
			} else {
				const buffer = await file.arrayBuffer();
				worker.postMessage({ id, action, buffer, options, fileName }, [buffer]);
			}
		} catch (err) {
			worker.removeEventListener('message', msgHandler);
			reject(err);
		}
	});
}

export function stopPdfWorker() {
	if (!workers.has('pdf')) return;
	const w = workers.get('pdf');
	try { w.terminate(); } catch { }
	workers.delete('pdf');
}
