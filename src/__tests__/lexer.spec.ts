import { TOKEN_TYPE } from '../constants';
import Lexer from '../Lexer';

it('Ignores whitespace characters', () => {
    const tab = String.fromCharCode(9);
    const space = ' ';
    const newline = '\n';

    const lexer = new Lexer(tab + space + newline);
    const result = lexer.analyze();

    expect(result.length).toEqual(0);
});
