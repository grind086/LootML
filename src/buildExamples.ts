import * as fs from 'fs';
import * as path from 'path';
import { compileCommonJS } from './';

const extRE = /\.loot$/;
const inDir = path.join(__dirname, '..', 'examples');
const outDir = path.join(__dirname, 'examples');

// Get list of input files
const exampleFiles = fs.readdirSync(inDir).filter(file => extRE.test(file));

// Set up the output directory
try {
    const outDirStats = fs.statSync(outDir);

    if (!outDirStats.isDirectory()) {
        throw new Error('Output directory exists, and is not a directory.');
    }
} catch (e) {
    if (e.code !== 'ENOENT') {
        throw e;
    }

    fs.mkdirSync(outDir);
}

// And start converting files
for (const file of exampleFiles) {
    fs.readFile(path.join(inDir, file), 'utf8', (readErr, data) => {
        if (readErr) {
            throw readErr;
        }

        const outFile = file.replace(extRE, '.js');

        fs.writeFile(path.join(outDir, outFile), compileCommonJS(data), 'utf8', writeErr => {
            if (writeErr) {
                throw writeErr;
            }

            // tslint:disable-next-line no-console
            console.log(`Created ${outFile}`);
        });
    });
}
