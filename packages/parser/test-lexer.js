import { RclLexer } from './dist/generated/RclLexer.js';
import { CharStreams } from 'antlr4ng';

const input = CharStreams.fromString('on :end');
const lexer = new RclLexer(input);
let token = lexer.nextToken();
while (token.type !== -1) {
  console.log('Token:', token.text, 'Type:', token.type, 'Name:', lexer.vocabulary.getSymbolicName(token.type));
  token = lexer.nextToken();
}