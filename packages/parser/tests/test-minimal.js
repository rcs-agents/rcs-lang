// Minimal grammar test
module.exports = grammar({
  name: "test",
  
  rules: {
    source_file: $ => repeat($.statement),
    
    statement: $ => choice(
      $.import_statement,
      $.simple_agent
    ),
    
    import_statement: $ => seq(
      'import',
      $.path
    ),
    
    path: $ => /[a-zA-Z][a-zA-Z0-9_\/]*/,
    
    simple_agent: $ => seq(
      'agent',
      $.identifier
    ),
    
    identifier: $ => /[A-Z][a-zA-Z0-9_]*/
  }
});