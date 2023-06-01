import { Volume } from'memfs';

const vol = Volume.fromJSON({
    './dir': null,
    './file.txt': 'Hello, world!',
}, '/app');

try {
    vol.writeFileSync('/app/dir/someFile.txt', 'Some content');
} catch (err) {
    console.error(err);
}

try {
    console.log(vol.readFileSync('/app/file.txt', 'utf-8'));
} catch (err) {
    console.error(err);
}
