/* global atom */

'use strict';

function normaliseConfig (config) {
    var normalised = {};
    for (var option in config) {
        if (!{}.hasOwnProperty.call(config, option)) { return; }
        normalised[option] = config[option] === true ? {} : config[option];
    }
    return normalised;
}

module.exports = {
    config: {
        autoprefixer: {
            title: 'Remove old prefixes',
            description: 'Uses autoprefixer to remove old vendor prefixes.',
            type: 'boolean',
            default: true
        },
        comments: {
            title: 'Remove comments',
            type: 'boolean',
            default: true
        },
        fonts: {
            title: 'Optimise font family values',
            type: 'boolean',
            default: true
        },
        idents: {
            title: 'Reduce custom identifiers',
            type: 'boolean',
            default: true
        },
        merge: {
            title: 'Merge adjacent rules',
            type: 'boolean',
          default: true
        },
        sourcemap: {
            title: 'Generate an inline sourcemap',
            type: 'boolean',
            default: false
        },
        unused: {
            title: 'Remove unused at-rules',
            type: 'boolean',
            default: true
        },
        urls: {
            title: 'Normalise URL values',
            type: 'boolean',
            default: true
        },
        zindex: {
            title: 'Rebase z-index values',
            type: 'boolean',
            default: true
        }
    },
    activate: function(state) {
        atom.commands.add('atom-workspace', 'cssnano:process', this.process);
    },
    process: function () {
        var editor = atom.workspace.getActiveTextEditor();

        if (!editor) { return; }

        var cssnano = require('cssnano');

        var opts = normaliseConfig({
            autoprefixer:     atom.config.get('cssnano.autoprefixer'),
            calc:             atom.config.get('cssnano.calc'),
            discardComments:  atom.config.get('cssnano.comments'),
            minifyFontValues: atom.config.get('cssnano.fonts'),
            mergeIdents:      atom.config.get('cssnano.idents'),
            mergeRules:       atom.config.get('cssnano.merge'),
            sourcemap:        atom.config.get('cssnano.sourcemap'),
            discardUnused:    atom.config.get('cssnano.unused'),
            normalizeUrl:     atom.config.get('cssnano.urls'),
            zindex:           atom.config.get('cssnano.zindex')
        });

        var selection = editor.getSelectedText();
        var text = selection || editor.getText();

        cssnano.process(text, opts).then(function (result) {
            if (selection.length) {
                editor.setTextInBufferRange(editor.getSelectedBufferRange(), result.css);
            } else {
                editor.setText(result.css);
            }
        }, function (err) {
            console.error(err.message);
            atom.beep();
        });
    }
};
