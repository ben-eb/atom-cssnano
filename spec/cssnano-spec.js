/* global atom, jasmine, describe, it, expect, beforeEach, waitsForPromise */

'use strict';

var pkg = 'cssnano';

function runTest (element, editor, cssin, cssout) {
    editor.setText(cssin);
    editor.onDidChange(function () {
        expect(editor.getText()).toBe(cssout);
    });
    atom.commands.dispatch(element, pkg + ':process');
}

describe(pkg, function () {
    var editor,
        workspaceElement;

    beforeEach(function () {
        workspaceElement = atom.views.getView(atom.workspace);
        jasmine.attachToDOM(workspaceElement);
        return waitsForPromise(function () {
            return atom.packages.activatePackage(pkg).then(function () {
                return atom.workspace.open('sample.js');
            }).then(function () {
                editor = atom.workspace.getActiveTextEditor();
                return editor;
            });
        });
    });

    it('should be activated', function () {
        expect(atom.packages.isPackageActive(pkg)).toBe(true);
    });

    it('should not crash on non-css languages', function () {
        runTest(
            workspaceElement,
            editor,
            'function () { return true; }',
            'function () { return true; }'
        );
    });

    it('should minify css', function () {
        runTest(
            workspaceElement,
            editor,
            'h1 { color: #ff0000; }',
            'h1{color:red}'
        );
    });

    it('should disable autoprefixer', function () {
        atom.config.set('cssnano', {
            autoprefixer: false
        });
        runTest(
            workspaceElement,
            editor,
            'h1 { -webkit-border-radius: 16px; border-radius: 16px }',
            'h1{-webkit-border-radius:1pc;border-radius:1pc}'
        );
    });

    it('should disable comments', function () {
        atom.config.set('cssnano', {
            comments: false
        });
        runTest(
            workspaceElement,
            editor,
            '/* test */',
            '/* test */'
        );
    });

    it('should disable font family optimisations', function () {
        atom.config.set('cssnano', {
            fonts: false
        });
        runTest(
            workspaceElement,
            editor,
            'h1 { font: "Helvetica Neue", Helvetica, sans-serif}',
            'h1{font:"Helvetica Neue", Helvetica, sans-serif}'
        );
    });

    it('should disable custom identifier reduction', function () {
        atom.config.set('cssnano', {
            idents: false
        });
        runTest(
            workspaceElement,
            editor,
            'h1{content: counter(section);counter-increment: section}',
            'h1{content:counter(section);counter-increment:section}'
        );
    });

    it('should disable rule merging', function () {
        atom.config.set('cssnano', {
            merge: false
        });
        runTest(
            workspaceElement,
            editor,
            'h1{width:500px}h2{width:500px}',
            'h1{width:500px}h2{width:500px}'
        );
    });

    it('should have sourcemap support', function () {
        atom.config.set('cssnano', {
            sourcemap: true
        });
        editor.setText('h1 { color: blue }');
        editor.onDidChange(function () {
            expect(editor.getText()).toContain('sourceMappingURL=data:application/json;base64');
        });
        atom.commands.dispatch(workspaceElement, pkg + ':process');
    });

    it('should disable unused rule removal', function () {
        atom.config.set('cssnano', {
            unused: false
        });
        runTest(
            workspaceElement,
            editor,
            '@keyframes x { 0% { opacity: 1 } to { opacity: 0 } }',
            '@keyframes x{0%{opacity:1}to{opacity:0}}'
        );
    });

    it('should disable url normalisation', function () {
        atom.config.set('cssnano', {
            urls: false
        });
        runTest(
            workspaceElement,
            editor,
            'h1{background:url("cat.jpg")}',
            'h1{background:url("cat.jpg")}'
        );
    });

    it('should disable z-index rebasing', function () {
        atom.config.set('cssnano', {
            zindex: false
        });
        runTest(
            workspaceElement,
            editor,
            'h1{z-index:500}',
            'h1{z-index:500}'
        );
    });
});
