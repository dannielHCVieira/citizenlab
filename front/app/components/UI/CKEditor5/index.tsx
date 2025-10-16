import React, {
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
  useMemo,
  useEffect,
} from 'react';

import { Label, IconTooltip, Box } from '@citizenlab/cl2-component-library';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor, EventInfo, type EditorConfig } from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

import { getEditorConfig } from './config';
import StyleContainer from './StyleContainer';

export interface Props {
  id: string;
  value?: string;
  label?: string | JSX.Element | null;
  labelTooltipText?: string | JSX.Element | null;
  noImages?: boolean;
  noVideos?: boolean;
  noAlign?: boolean;
  noLinks?: boolean;
  limitedTextFormatting?: boolean;
  maxHeight?: string;
  minHeight?: string;
  withCTAButton?: boolean;
  onChange?: (html: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  maxCharCount?: number;
  minCharCount?: number;
}

const CKEditor5 = ({
  id,
  value = '',
  label,
  labelTooltipText,
  noAlign = false,
  noImages = false,
  noVideos = false,
  noLinks = false,
  limitedTextFormatting = false,
  maxHeight,
  minHeight,
  withCTAButton = false,
  onChange,
  onBlur,
  onFocus,
  maxCharCount,
  minCharCount,
}: Props) => {
  const [editor, setEditor] = useState<ClassicEditor | null>(null);
  const [focussed, setFocussed] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const htmlRef = useRef<string | null>(null);
  const charCountTimerRef = useRef<NodeJS.Timeout | null>(null);

  const onChangeRef = useRef(onChange);
  const onBlurRef = useRef(onBlur);
  const onFocusRef = useRef(onFocus);

  useLayoutEffect(() => {
    onChangeRef.current = onChange;
    onBlurRef.current = onBlur;
    onFocusRef.current = onFocus;
  });

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (charCountTimerRef.current) {
        clearTimeout(charCountTimerRef.current);
      }
    };
  }, []);

  const config: EditorConfig = useMemo(
    () =>
      getEditorConfig({
        noImages,
        noVideos,
        noLinks,
        noAlign,
        limitedTextFormatting,
        withCTAButton,
        maxCharCount,
      }),
    [
      noImages,
      noVideos,
      noLinks,
      noAlign,
      limitedTextFormatting,
      withCTAButton,
      maxCharCount,
    ]
  );

  const handleReady = (editorInstance: ClassicEditor) => {
    setEditor(editorInstance);

    // Calculate initial character count
    const content = editorInstance.getData();
    const plainText = extractPlainText(content);
    setCharCount(plainText.length);
  };

  const handleChange = useCallback(
    (_event: EventInfo, editorInstance: ClassicEditor) => {
      const html = editorInstance.getData();

      if (html === htmlRef.current) return;

      htmlRef.current = html;

      // Debounce character count updates to avoid DOM manipulation on every keystroke
      if (maxCharCount || minCharCount) {
        if (charCountTimerRef.current) {
          clearTimeout(charCountTimerRef.current);
        }
        charCountTimerRef.current = setTimeout(() => {
          const plainText = extractPlainText(html);
          setCharCount(plainText.length);
        }, 150);
      }

      onChangeRef.current?.(html);
    },
    [maxCharCount, minCharCount]
  );

  const handleFocus = () => {
    setFocussed(true);
    onFocusRef.current?.();
  };

  const handleBlurEvent = () => {
    setFocussed(false);
    onBlurRef.current?.();
  };

  const handleLabelOnClick = useCallback(() => {
    editor?.focus();
  }, [editor]);

  const className = focussed ? 'focus' : '';

  // Helper function to extract plain text from HTML
  function extractPlainText(html: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  // Calculate character count color
  const getCharCountColor = () => {
    if (maxCharCount && charCount > maxCharCount) return 'red600';
    if (minCharCount && charCount < minCharCount) return 'red600';
    return 'textSecondary';
  };

  return (
    <StyleContainer
      maxHeight={maxHeight}
      minHeight={minHeight}
      className={className}
    >
      {label && (
        <Label htmlFor={id} onClick={handleLabelOnClick}>
          <span>{label}</span>
          {labelTooltipText && <IconTooltip content={labelTooltipText} />}
        </Label>
      )}
      <CKEditor
        editor={ClassicEditor}
        config={config}
        data={value}
        onReady={handleReady}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlurEvent}
      />
      {(maxCharCount || minCharCount) && (
        <Box
          display="flex"
          justifyContent="flex-end"
          mt="8px"
          color={getCharCountColor()}
        >
          {charCount}
          {maxCharCount && ` / ${maxCharCount}`}
          {minCharCount && ` (≥ ${minCharCount})`}
        </Box>
      )}
    </StyleContainer>
  );
};

export default CKEditor5;
