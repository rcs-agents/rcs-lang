import XCTest
import SwiftTreeSitter
import TreeSitterRcl

final class TreeSitterRclTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_rcl())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Rich Communication Language grammar")
    }
}
