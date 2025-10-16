import type { EditorConfig } from 'ckeditor5';
import {
  Essentials,
  Paragraph,
  Autoformat,
  Bold,
  Italic,
  Underline,
  Heading,
  Link,
  List,
  ListProperties,
  Indent,
  IndentBlock,
  MediaEmbed,
  ImageBlock,
  ImageInline,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageResize,
  ImageInsert,
  ImageInsertViaUrl,
  ImageUpload,
  AutoImage,
  ImageTextAlternative,
  PasteFromOffice,
  Base64UploadAdapter,
} from 'ckeditor5';

const LICENSE_KEY =
  process.env.CKEDITOR_LICENSE_KEY ||
  'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NjE4Njg3OTksImp0aSI6ImU4YTFiNDcxLTM1YzktNDIxYi1iZjM1LTM1MmM5NWMzYTIyMiIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjZkNjYxMmFlIn0.jhkdBJcogdzqEUrSo6p-fXNbGm4n7ua-kxxKutUHqE0iI_ur8DO_n8SjBxQgDVq-S61YDKnwdDDFBrf7WEK3YQ';

interface ConfigOptions {
  noImages?: boolean;
  noVideos?: boolean;
  noLinks?: boolean;
  noAlign?: boolean;
  limitedTextFormatting?: boolean;
  withCTAButton?: boolean;
  maxCharCount?: number;
  placeholder?: string;
}

export function getEditorConfig(options: ConfigOptions = {}): EditorConfig {
  const {
    noImages = false,
    noVideos = false,
    noLinks = false,
    noAlign = false,
    limitedTextFormatting = false,
    withCTAButton = false,
    maxCharCount,
    placeholder = 'Type or paste your content here!',
  } = options;

  // Build toolbar items based on options
  const toolbarItems: string[] = ['undo', 'redo', '|'];

  if (!limitedTextFormatting) {
    toolbarItems.push('heading', '|');
  }

  toolbarItems.push('bold', 'italic', 'underline');

  if (!limitedTextFormatting) {
    toolbarItems.push('|', 'bulletedList', 'numberedList', 'outdent', 'indent');
  }

  if (!noAlign && !limitedTextFormatting) {
    // Note: Alignment requires adding alignment plugin if not in builder
    // For now, we'll skip it since it's not critical
  }

  if (!noLinks) {
    toolbarItems.push('|', 'link');
  }

  if (!noImages) {
    toolbarItems.push('|', 'insertImage');
  }

  if (!noVideos) {
    toolbarItems.push('|', 'mediaEmbed');
  }

  if (withCTAButton) {
    // Custom button plugin would go here
    // toolbarItems.push('|', 'customButton');
  }

  // Build plugins list based on options
  const plugins: any[] = [
    Essentials,
    Paragraph,
    Autoformat,
    Bold,
    Italic,
    Underline,
    PasteFromOffice,
  ];

  if (!limitedTextFormatting) {
    plugins.push(Heading, List, ListProperties, Indent, IndentBlock);
  }

  if (!noLinks) {
    plugins.push(Link);
  }

  if (!noImages) {
    plugins.push(
      ImageBlock,
      ImageInline,
      ImageToolbar,
      ImageCaption,
      ImageStyle,
      ImageResize,
      ImageInsert,
      ImageInsertViaUrl,
      ImageUpload,
      AutoImage,
      ImageTextAlternative,
      Base64UploadAdapter
    );
  }

  if (!noVideos) {
    plugins.push(MediaEmbed);
  }

  const config: EditorConfig = {
    toolbar: {
      items: toolbarItems,
      shouldNotGroupWhenFull: false,
    },
    plugins,
    placeholder,
    licenseKey: LICENSE_KEY,
  };

  // Image configuration
  if (!noImages) {
    config.image = {
      styles: {
        options: [
          'inline',
          'alignLeft',
          'alignCenter',
          'alignRight',
          'alignBlockLeft',
          'alignBlockRight',
          'block',
          'side',
        ],
      },
      toolbar: [
        'imageTextAlternative',
        'toggleImageCaption',
        '|',
        'imageStyle:inline',
        'imageStyle:alignBlockLeft',
        'imageStyle:alignCenter',
        'imageStyle:alignBlockRight',
        '|',
        'resizeImage',
      ],
      resizeOptions: [
        {
          name: 'resizeImage:original',
          value: null,
          label: 'Original',
        },
        {
          name: 'resizeImage:50',
          value: '50',
          label: '50%',
        },
        {
          name: 'resizeImage:75',
          value: '75',
          label: '75%',
        },
      ],
    };
  }

  // Media embed configuration
  if (!noVideos) {
    config.mediaEmbed = {
      previewsInData: true,
      providers: [
        {
          name: 'youtube',
          url: [
            /^(?:m\.)?youtube\.com\/watch\?v=([\w-]+)/,
            /^(?:m\.)?youtube\.com\/v\/([\w-]+)/,
            /^youtube\.com\/embed\/([\w-]+)/,
            /^youtu\.be\/([\w-]+)/,
          ],
          html: (match) => {
            const id = match[1];
            return (
              '<div style="position: relative; padding-bottom: 56.2493%; height: 0;">' +
              `<iframe src="https://www.youtube.com/embed/${id}" ` +
              'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
              'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
              '</iframe>' +
              '</div>'
            );
          },
        },
        {
          name: 'vimeo',
          url: /^vimeo\.com\/(\d+)/,
          html: (match) => {
            const id = match[1];
            return (
              '<div style="position: relative; padding-bottom: 56.2493%; height: 0;">' +
              `<iframe src="https://player.vimeo.com/video/${id}" ` +
              'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
              'frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen>' +
              '</iframe>' +
              '</div>'
            );
          },
        },
      ],
    };
  }

  // Link configuration
  if (!noLinks) {
    config.link = {
      addTargetToExternalLinks: true,
      defaultProtocol: 'https://',
      decorators: {
        addSecurityAttributes: {
          mode: 'automatic',
          callback: (url: string) => /^(https?:)?\/\//.test(url),
          attributes: {
            rel: 'noreferrer noopener nofollow',
          },
        },
      },
    };
  }

  // Heading configuration
  if (!limitedTextFormatting) {
    config.heading = {
      options: [
        {
          model: 'paragraph',
          title: 'Paragraph',
          class: 'ck-heading_paragraph',
        },
        {
          model: 'heading1',
          view: 'h1',
          title: 'Heading 1',
          class: 'ck-heading_heading1',
        },
        {
          model: 'heading2',
          view: 'h2',
          title: 'Heading 2',
          class: 'ck-heading_heading2',
        },
        {
          model: 'heading3',
          view: 'h3',
          title: 'Heading 3',
          class: 'ck-heading_heading3',
        },
        {
          model: 'heading4',
          view: 'h4',
          title: 'Heading 4',
          class: 'ck-heading_heading4',
        },
        {
          model: 'heading5',
          view: 'h5',
          title: 'Heading 5',
          class: 'ck-heading_heading5',
        },
        {
          model: 'heading6',
          view: 'h6',
          title: 'Heading 6',
          class: 'ck-heading_heading6',
        },
      ],
    };
  }

  return config;
}
