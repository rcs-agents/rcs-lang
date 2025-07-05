package tree_sitter_rcl_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_rcl "github.com/rcs-agents/rcl-tree-sitter/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_rcl.Language())
	if language == nil {
		t.Errorf("Error loading Rich Communication Language grammar")
	}
}
