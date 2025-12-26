# PDF Annotator React

A modern React component library for PDF annotation. This library allows you to easily add annotation capabilities to PDFs in your React applications.

## Features

- View PDFs with page navigation
- Create and manage annotations:
  - Highlights
  - Underlines
  - Strikeouts
  - Rectangles
  - Freehand drawing
  - Text notes
  - Comments
  - Pins with tags
- Customize annotation colors and thicknesses
- Get callbacks for annotation events (create, update, delete, select)
- Responsive design with auto-fit to width option
- Loading indicators with retry mechanism
- View-only mode for read-only annotations
- Modern React hooks-based API

## Installation

```bash
npm install pdf-annotator-react
# or 
yarn add pdf-annotator-react
```

## Usage

### Basic Example

```jsx
import React, { useState } from 'react';
import { PdfAnnotator, AnnotationMode } from 'pdf-annotator-react';

const MyPdfAnnotator = () => {
  const [annotations, setAnnotations] = useState([]);
  
  const handleAnnotationCreate = (newAnnotation) => {
    setAnnotations(prev => [...prev, newAnnotation]);
  };
  
  const handleAnnotationUpdate = (updatedAnnotation) => {
    setAnnotations(prev => 
      prev.map(a => a.id === updatedAnnotation.id ? updatedAnnotation : a)
    );
  };
  
  const handleAnnotationDelete = (annotationId) => {
    setAnnotations(prev => prev.filter(a => a.id !== annotationId));
  };
  
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <PdfAnnotator
        url="https://example.com/sample.pdf"
        annotations={annotations}
        onAnnotationCreate={handleAnnotationCreate}
        onAnnotationUpdate={handleAnnotationUpdate}
        onAnnotationDelete={handleAnnotationDelete}
        annotationMode={AnnotationMode.HIGHLIGHT}
        fitToWidth={true}
      />
    </div>
  );
};

export default MyPdfAnnotator;
```

### Advanced Example with Custom Colors

```jsx
import React, { useState } from 'react';
import { PdfAnnotator, AnnotationMode } from 'pdf-annotator-react';

const MyPdfAnnotator = () => {
  const [annotations, setAnnotations] = useState([]);
  const [mode, setMode] = useState(AnnotationMode.NONE);
  
  // Annotation event handlers
  const handleAnnotationCreate = (newAnnotation) => {
    setAnnotations(prev => [...prev, newAnnotation]);
  };
  
  const handleAnnotationUpdate = (updatedAnnotation) => {
    setAnnotations(prev => 
      prev.map(a => a.id === updatedAnnotation.id ? updatedAnnotation : a)
    );
  };
  
  const handleAnnotationDelete = (annotationId) => {
    setAnnotations(prev => prev.filter(a => a.id !== annotationId));
  };
  
  const handleAnnotationSelect = (selectedAnnotation) => {
    console.log('Selected annotation:', selectedAnnotation);
  };
  
  // Tools toolbar
  const renderToolbar = () => (
    <div style={{ marginBottom: '10px' }}>
      <button onClick={() => setMode(AnnotationMode.NONE)}>Select</button>
      <button onClick={() => setMode(AnnotationMode.HIGHLIGHT)}>Highlight</button>
      <button onClick={() => setMode(AnnotationMode.UNDERLINE)}>Underline</button>
      <button onClick={() => setMode(AnnotationMode.RECTANGLE)}>Rectangle</button>
      <button onClick={() => setMode(AnnotationMode.DRAWING)}>Draw</button>
      <button onClick={() => setMode(AnnotationMode.COMMENT)}>Comment</button>
      <button onClick={() => setMode(AnnotationMode.PIN)}>Pin</button>
    </div>
  );
  
  return (
    <div>
      {renderToolbar()}
      <div style={{ height: 'calc(100vh - 40px)', width: '100%' }}>
        <PdfAnnotator
          url="https://example.com/sample.pdf"
          annotations={annotations}
          onAnnotationCreate={handleAnnotationCreate}
          onAnnotationUpdate={handleAnnotationUpdate}
          onAnnotationDelete={handleAnnotationDelete}
          onAnnotationSelect={handleAnnotationSelect}
          annotationMode={mode}
          onAnnotationModeChange={setMode}
          // Custom colors
          highlightColor="rgba(255, 230, 0, 0.4)"
          underlineColor="rgba(0, 100, 255, 0.7)"
          rectangleColor="rgba(255, 0, 0, 0.3)"
          drawingColor="#22cc22"
          defaultThickness={8}
          fitToWidth={true}
        />
      </div>
    </div>
  );
};

export default MyPdfAnnotator;
```

## Props

The `PdfAnnotator` component accepts the following props:

| Prop | Type | Description |
|------|------|-------------|
| `url` | string | URL of the PDF to display |
| `annotations` | Array | Array of annotation objects |
| `scale` | number | Scale factor for rendering (default: 1.0) |
| `pageNumber` | number | Initial page number to display (default: 1) |
| `onDocumentLoadSuccess` | function | Callback when PDF loads successfully |
| `onPageChange` | function | Callback when page changes |
| `annotationMode` | AnnotationMode | Current annotation mode |
| `onAnnotationModeChange` | function | Callback when annotation mode changes |
| `onAnnotationCreate` | function | Callback when an annotation is created |
| `onAnnotationUpdate` | function | Callback when an annotation is updated |
| `onAnnotationDelete` | function | Callback when an annotation is deleted |
| `onAnnotationSelect` | function | Callback when an annotation is selected |
| `onAnnotationsChange` | function | Callback with full annotations array when any change occurs |
| `highlightColor` | string | Custom color for highlight annotations |
| `underlineColor` | string | Custom color for underline annotations |
| `strikeoutColor` | string | Custom color for strikeout annotations |
| `rectangleColor` | string | Custom color for rectangle annotations |
| `drawingColor` | string | Custom color for drawing annotations |
| `textColor` | string | Custom color for text annotations |
| `commentColor` | string | Custom color for comment annotations |
| `pinColor` | string | Custom color for pin annotations |
| `customCategories` | Array | Custom categories for annotations with colors |
| `pdfWorkerSrc` | string | Custom PDF.js worker source URL |
| `fitToWidth` | boolean | Whether to fit the PDF to the container width (default: true) |
| `defaultThickness` | number | Default thickness for annotations like drawing (default: 8) |
| `viewOnly` | boolean | Whether the component is in view-only mode (default: false) |

## Ref API

The `PdfAnnotator` component also exposes a ref API with the following methods:

| Method | Description |
|--------|-------------|
| `getAnnotationsJSON()` | Returns a JSON string of all annotations |
| `selectAnnotationById(id)` | Selects an annotation by ID and scrolls to it |

```jsx
import React, { useRef } from 'react';
import { PdfAnnotator } from 'pdf-annotator-react';

const MyComponent = () => {
  const annotatorRef = useRef(null);
  
  const handleExport = () => {
    const json = annotatorRef.current.getAnnotationsJSON();
    console.log(json);
  };
  
  const handleFind = () => {
    annotatorRef.current.selectAnnotationById('some-annotation-id');
  };
  
  return (
    <>
      <button onClick={handleExport}>Export Annotations</button>
      <button onClick={handleFind}>Find Annotation</button>
      <PdfAnnotator ref={annotatorRef} url="https://example.com/sample.pdf" />
    </>
  );
};
```

## Recent Improvements

- **Enhanced Loading States**: Added loading indicators with spinner animation when pages are loading
- **Auto-Retry Mechanism**: Automatic retry system for failed PDF rendering with fallback to non-WebGL rendering
- **Improved Annotation Selection**: Fixed coordinate transformation for more accurate annotation selection
- **Better Error Handling**: Clear error messages when PDF rendering fails
- **Responsive Design**: Added fit-to-width option and better handling of window resizing
- **Support for Pin Annotations**: Added pins with tag support
- **View-Only Mode**: Added support for read-only annotation viewing

## License

MIT 