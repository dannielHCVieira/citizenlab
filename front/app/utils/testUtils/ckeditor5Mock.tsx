import React from 'react';

// Mock CKEditor component
export const CKEditor = ({ data, onChange, onReady, onFocus, onBlur }: any) => {
  const [value, setValue] = React.useState(data || '');
  const editorRef = React.useRef<any>(null);

  // Create editor instance once
  if (!editorRef.current) {
    editorRef.current = {
      getData: () => value,
      setData: (newData: string) => setValue(newData),
      focus: () => {},
    };
  }

  // Update getData to return current value
  editorRef.current.getData = () => value;

  // Call onReady only once when component mounts
  React.useEffect(() => {
    if (onReady && editorRef.current) {
      onReady(editorRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLDivElement>) => {
    const newValue = e.currentTarget.innerHTML;
    setValue(newValue);
    if (onChange && editorRef.current) {
      editorRef.current.getData = () => newValue;
      onChange({}, editorRef.current);
    }
  };

  return (
    <div className="ck-editor" data-testid="ckeditor-mock">
      <div className="ck-toolbar" />
      <div
        className="ck-editor__editable"
        contentEditable
        suppressContentEditableWarning
        onInput={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
};

// Mock ClassicEditor
export class ClassicEditor {
  static create() {
    return Promise.resolve({
      getData: () => '',
      setData: () => {},
      focus: () => {},
      destroy: () => {},
    });
  }
}

// Mock EventInfo
export class EventInfo {}

// Mock EditorConfig
export type EditorConfig = any;
