# Changelog

All notable changes to the pdf-annotator-react package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.2] - 2025-05-11

### Added
- 

### Changed
- 

### Fixed
- 

## [0.4.1] - 2025-04-11

### Added
- Enhanced canvas content verification to detect blank pages
- Multiple rendering strategies with progressive fallbacks
- Improved debugging information for PDF page rendering

### Changed
- Optimized rendering process to prevent black/blank screens
- Enhanced error handling with detailed logging

### Fixed
- Fixed critical issue with PDFs displaying as black screens
- Added explicit white background to canvas rendering
- Implemented robust retry mechanism with different rendering options

## [0.4.0] - 2025-04-11

### Added
- Package publishing with improved documentation
- Simplified version management

### Changed
- Version bump for publishing to npm registry
- Updated licensing and distribution information

### Fixed
- No new fixes in this version (publishing release from 0.3.0)

## [0.3.0] - 2025-04-11

### Added
- Enhanced PDF loading states with spinner animation
- Auto-retry mechanism for failed PDF rendering
- Fallback to non-WebGL rendering when WebGL fails
- Better error handling with clear error messages
- Improved responsiveness with better window resize handling
- Updated README with comprehensive documentation

### Changed
- Simplified coordinate transformation in AnnotationLayer
- Improved handling of annotation clicks
- Enhanced the positioning logic for annotation detail dialogs

### Fixed
- Fixed issue with blank pages by adding proper loading states
- Fixed annotation selection offset/coordinate mismatch
- Fixed coordinate transformation that was causing annotation clicking issues
- Improved handling of event propagation for better interaction

## [0.2.8] - 2025-04-11

### Added
- 

### Changed
- 

### Fixed
- 

## [0.2.7] - 2025-04-11

### Added
- 

### Changed
- 

### Fixed
- 

## [0.2.6] - 2025-04-11

### Added
- 

### Changed
- 

### Fixed
- 

## [0.1.75] - 2025-04-09

### Added
- 

### Changed
- 

### Fixed
- 

## [0.1.74] - 2025-04-09

### Added
- 

### Changed
- 

### Fixed
- 

## [0.1.73] - 2025-04-09

### Added
- 

### Changed
- Enhanced annotation IDs to use MongoDB-style ObjectIds
  - Updated ID generation to create proper 24-character hexadecimal strings
  - Format follows MongoDB convention with timestamp + random components
  - Ensures consistent ID format across all annotation types
  - Improved compatibility with MongoDB databases
  - Standardized ID generation across utils.ts and useAnnotations.ts

### Fixed
- 

## [0.1.72] - 2025-04-09

### Added
- 

### Changed
- 

### Fixed
- Fixed complex category structure issues in annotation filtering
  - Added category normalization to handle inconsistent category structures
  - Enhanced filtering logic to better handle different category object formats
  - Implemented automatic category structure repair for annotations with invalid categories
  - Added more detailed logging to help diagnose category structure issues
  - Improved category handling when switching between different categories
  - Fixed undefined competencia values by handling multiple object structures

## [0.1.71] - 2025-04-09

### Added
- 

### Changed
- 

### Fixed
- Fixed category filtering in annotation display
  - Completely refactored category comparison logic to handle complex category objects
  - Added safe extraction of competencia ID values regardless of object structure
  - Fixed issue where annotations with categories weren't being filtered correctly
  - Added detailed logging to help diagnose filtering problems
  - Improved type safety with better TypeScript assertions and checks

## [0.1.70] - 2025-04-09

### Added
- 

### Changed
- 

### Fixed
- Fixed category filtering that wasn't working correctly
  - Added better debugging and logging to diagnose filtering issues
  - Fixed comparison of category.competencia values between annotations and selected category
  - Improved code readability in the filtering function
  - Added null checks to prevent errors with annotations without categories

## [0.1.69] - 2025-04-09

### Added
- 

### Changed
- 

### Fixed
- Fixed category filtering issue
  - Fixed problem where selecting "Filtrar por Categoria" (no category) wasn't properly clearing the filter
  - Added proper handling of undefined category in the ToolBar component
  - Added logging to help diagnose filtering issues
  - Ensured consistent behavior when switching between categories

## [0.1.68] - 2025-04-09

### Added
- 

### Changed
- 

### Fixed
- 

## [0.1.67] - 2025-04-09

### Added
- 

### Changed
- 

### Fixed
- 

## [0.1.66] - 2025-04-09

### Added
- 

### Changed
- 

### Fixed
- 

## [0.1.65] - 2025-04-07

### Added
- 

### Changed
- Improved annotation positioning for single-page PDFs
  - Changed annotation scrolling to position annotations at the top of the viewport
  - Added a small 20px margin at the top for better readability
  - Simplified scrolling logic by removing percentage-based positioning
  - Enhanced user experience for single-page PDF documents
  - Optimized annotation visibility with more intuitive positioning

### Fixed
- 

## [0.1.64] - 2025-04-06

### Added
- 

### Changed
- 

### Fixed
- Improved annotation selection accuracy
  - Removed problematic highlight-pulse effect that was causing visual issues
  - Simplified scrolling mechanism for more reliable positioning
  - Removed unused CSS animations and styles
  - Focused only on precise annotation positioning
  - Improved direct scroll behavior for more reliable results

## [0.1.63] - 2025-04-06

### Added
- 

### Changed
- 

### Fixed
- Critical fixes for annotation selection scroll positioning
  - Fixed issue where annotation selection would scroll to the correct page but not position the annotation in view
  - Added direct scrollTop positioning for more reliable initial scrolling
  - Implemented two-phase scrolling with immediate and smooth adjustment for better accuracy
  - Added multiple scroll attempts for annotations after page changes
  - Enhanced annotation highlighting with additional wrapper highlighting for better visibility
  - Improved fallback mechanisms for cases where annotation elements aren't found
  - Added more detailed logging for troubleshooting any positioning issues

## [0.1.62] - 2025-04-05

### Added
- 

### Changed
- 

### Fixed
- Critical fixes for annotation selection and highlighting
  - Fixed issue where highlight-pulse effect was incorrectly affecting the entire PDF
  - Fixed annotation scrolling that would incorrectly scroll to the top of the document
  - Improved highlighting to only target SVG elements with specific tag checks
  - Enhanced scrolling algorithm with multiple fallback strategies
  - Added requestAnimationFrame for smoother scrolling behavior
  - Improved timing coordination between page changes and scrolling
  - Added more detailed logging for easier troubleshooting

## [0.1.61] - 2025-04-05

### Added
- 

### Changed
- 

### Fixed
- Fixed annotation selection visual effects and scrolling
  - Resolved issue where highlight-pulse effect was incorrectly applied to the entire PDF
  - Replaced stroke-width manipulation with outline for more reliable highlighting
  - Added better data attributes to all annotation types for reliable targeting
  - Fixed scrolling algorithm to properly position selected annotations in viewport
  - Added robust logging to help diagnose positioning issues
  - Implemented separate timing for page change vs. same page selection
  - Added multiple element targeting for more reliable highlighting

## [0.1.60] - 2025-04-04

### Added
- 

### Changed
- 

### Fixed
- Improved annotation selection scroll behavior
  - Fixed issue where selecting annotations would scroll to the top of the document
  - Enhanced scroll algorithm to position annotations at 30% from the top of the viewport
  - Added visual pulse effect to highlight selected annotations
  - Improved scroll targeting using actual page and annotation positions
  - Optimized animation timing for better performance

## [0.1.59] - 2025-04-04

### Added
- 

### Changed
- 

### Fixed
- Improved annotation deletion user experience
  - AnnotationDetails dialog now automatically closes after confirming deletion
  - Prevents users from having to manually close the dialog after deletion
  - Creates a more streamlined workflow for annotation management
- Enhanced scroll behavior when selecting annotations by ID
  - Fixed issue where selectAnnotationById would scroll to the top of the page
  - Improved accuracy of scrolling to specific annotations using actual page position
  - Added visual highlighting effect to make selected annotations easier to locate
  - Optimized annotation positioning to appear at 30% from the top of the viewport

## [0.1.58] - 2025-04-04

### Added
- 

### Changed
- 

### Fixed
- 

## [0.1.57] - 2025-04-03

### Added
- 

### Changed
- Improved toolbar responsiveness for small screen sizes
  - Redesigned ToolBar component with mobile-first approach
  - Added collapsible menu for smaller screens with a hamburger toggle
  - Essential controls (zoom and page navigation) stay visible on mobile screens
  - Drawing tools are hidden in the expandable menu on mobile
  - Enhanced ThicknessDropdown to be more responsive with adaptive layout
  - Added optimized grid layout for dropdown options on mobile
  - Simplified text labels and optimized spacing on smaller screens

### Fixed
- Fixed toolbar layout issues on smaller screen widths
  - Removed UI clutter in narrow viewports through better component organization
  - Implemented responsive breakpoints using Tailwind's responsive classes
  - Added proper mobile styling for all toolbar components
  - Fixed dropdown components to use full width on mobile and auto width on desktop

## [0.1.56] - 2025-04-01

### Added
- 

### Changed
- 

### Fixed
- 

## [0.1.55] - 2025-04-01

### Added
- 

### Changed
- 

### Fixed
- 

## [0.1.54] - 2024-03-22

### Changed
- Updated build dependencies to resolve deprecation warnings
  - Updated rollup to v4.9.6
  - Updated @rollup/plugin-node-resolve to v15.2.3
  - Added resolutions for glob and inflight to use newer versions
  - Improved build tooling stability and removed deprecated package warnings

### Fixed
- Resolved React peer dependency warnings
  - Added React and React DOM to dependencies while maintaining them in devDependencies
  - Ensures proper peer dependency satisfaction for react-icons and lucide-react
  - Improves package installation and dependency resolution

## [0.1.53] - 2025-03-22

### Added
- 

### Changed
- Improved annotation details dialog behavior for external selection
  - Modified `selectAnnotationById` to only highlight annotations without showing the dialog when selected from external lists
  - Added `showDetailsDialog` state to control dialog visibility independently from annotation selection
  - Maintained scrolling behavior to ensure selected annotations are visible
  - Enhanced user experience by eliminating dialog positioning issues for external selection
  - Improved conditional rendering to control dialog visibility based on selection source

### Fixed
- Resolved annotation dialog positioning issues
  - Fixed problem where the dialog would appear in the middle or corner of screen when selecting annotations by ID
  - Simplified the dialog display logic to avoid rendering issues with the `AnnotationDetails` component
  - Improved the overall user interface by making annotation selection via ID more predictable

## [0.1.52] - 2025-03-21

### Added
- 

### Changed
- 

### Fixed
- 

## [0.1.51] - 2025-03-20

### Added
- 

### Changed
- 

### Fixed
- 

## [0.1.51] - 2025-03-20

### Fixed
- Fixed annotation dialog appearing and closing issues
  - Resolved problem where annotation dialog would not appear when selecting annotations
  - Added proper delay to click-away behavior to prevent immediate closing of newly opened dialogs
  - Improved dialog detection logic with multiple selectors for better reliability
  - Enhanced the scroll handling to prevent dialog from disappearing unexpectedly
  - Added data-testid attributes for more reliable dialog identification

## [0.1.50] - 2025-03-20

### Added
- Category filtering for annotations
  - Added ability to filter annotations by category using the category dropdown
  - When a category is selected, only annotations with that category are displayed
  - Added a clear button to remove the filter and display all annotations
  - Improved user experience for viewing specific categories of annotations
  - Clean UI integration with existing category dropdown

### Changed
- Enhanced annotation dialog user experience
  - Added automatic dialog closing when scrolling to improve document navigation
  - Implemented click-away behavior to close the dialog when clicking outside annotations
  - Improved overall usability by making the dialog less intrusive during PDF browsing
  - Better focus management for annotation selection and editing workflows

### Fixed
- Improved annotation details dialog positioning
  - When selecting an annotation from an external list, the details dialog now consistently positions at 20% from the top-left of the annotation
  - Added fallback positioning for cases when page containers aren't immediately available
  - Implemented auto-positioning after page scrolling to ensure dialog stays related to the annotation
  - Enhanced user experience by eliminating cases where dialog appears at unrelated positions

## [0.1.46] - 2025-03-19

### Added
- 

### Changed
- 

### Fixed
- Improved annotation selection behavior from external lists
  - When selecting an annotation from an external list or component, the annotation is now highlighted in the PDF view
  - The annotation details dialog now appears next to the selected annotation for better context
  - Provides a more intuitive user experience with consistent positioning
  - Implementation ensures the dialog doesn't obscure the annotation being referenced

## [0.1.45] - 2025-03-19

### Added
- 

### Changed
- 

### Fixed
- 

## [0.1.42] - 2025-03-19

### Added
- 

### Changed
- 

### Fixed
- 

## [0.1.41] - 2025-03-19

### Added
- 

### Changed
- 

### Fixed
- 

## [Unreleased]

### Added
- 

### Changed
- 

### Fixed
- 

## [0.1.41] - 2024-06-30

### Added
- Enhanced viewOnly mode in PdfAnnotator component
  - Hidden annotation tools when in viewOnly mode while preserving document viewing capabilities
  - Simplified toolbar in viewOnly mode to show only zoom and pagination controls
  - Added "Modo Visualização" label to indicate view-only status
  - Maintained the ability to view all annotations in viewOnly mode
  - Improved user experience by removing irrelevant controls for viewers
  - Added protection against entering edit mode on annotations when in viewOnly mode
- External annotation selection capabilities
  - Added `selectAnnotationById` method to PdfAnnotatorRef
  - Parent components can now highlight specific annotations from external lists/tables
  - Automatically scrolls to the page containing the selected annotation
  - Works in both normal and viewOnly modes
  - Implementation example:
    ```tsx
    const pdfAnnotatorRef = useRef<PdfAnnotatorRef>(null);
    
    // In your table component
    const handleHighlightClick = (annotationId) => {
      pdfAnnotatorRef.current?.selectAnnotationById(annotationId);
    };
    
    // In your render method
    <PdfAnnotator
      ref={pdfAnnotatorRef}
      // other props...
    />
    ```

### Changed
- 

### Fixed
- Fixed PDF.js canvas rendering error when navigating between pages
  - Added proper cleanup of render tasks when component unmounts
  - Implemented cancellation of previous render tasks before starting new ones
  - Added check for component mount status to prevent rendering to unmounted components
  - Fixed coordinates calculation in right-click handler to properly use scale
  - Improved canvas context creation with alpha:false for better performance

## [0.1.40] - 2025-03-19

### Added
- 

### Changed
- 

### Fixed
- 

## [0.1.39] - 2025-03-19

### Added
- 

### Changed
- 

### Fixed
- 

## [0.1.38] - 2025-03-18

### Added
- 

### Changed
- 

### Fixed
- 

## [0.1.37] - 2024-06-12

### Added
- View-only mode for annotations
  - Added `viewOnly` prop to PdfAnnotator component
  - When enabled, users can view but not edit or delete annotations
  - Annotations can still be selected and viewed
  - Ideal for scenarios where multiple user roles access the same content
  - Implementation example:
    ```tsx
    // Editor vs Viewer roles
    <PdfAnnotator
      url="sample.pdf"
      annotations={annotations}
      viewOnly={userRole === 'viewer'} // true for viewers, false for editors
      onAnnotationsChange={handleAnnotationsChange}
    />
    ```
- Enhanced parent component control over annotations
  - Added `onAnnotationsChange` callback to AnnotationDetails component
  - Ensures parent components can react to annotation changes
  - Improves state management in complex applications
  - Implementation example:
    ```tsx
    // In parent component
    const [annotations, setAnnotations] = useState([]);
    
    const handleAnnotationsChange = (updatedAnnotations) => {
      setAnnotations(updatedAnnotations);
      // Save to server, localStorage, etc.
      saveAnnotationsToBackend(updatedAnnotations);
    };
    
    // Pass to PdfAnnotator
    <PdfAnnotator
      annotations={annotations}
      onAnnotationsChange={handleAnnotationsChange}
    />
    ```
  - Full lifecycle support for fetching, saving, and resuming work
  - Integration with custom backend services for annotation persistence

### Changed
- Improved two-column layout in AnnotationDetails component
  - Made left and right columns equal in width for better balance
  - Expanded container width when tag selector is open
  - Enhanced spacing between columns for better visual separation
  - Improved overall usability of the annotation interface
- Relocated close button to top-right corner in AnnotationDetails component
  - Improved usability with standard placement pattern
  - Enhanced visual consistency with common UI patterns
  - Added proper aria-label for accessibility

### Fixed
- 

## [0.1.36] - 2025-03-18

### Added
- 

### Changed
- 

### Fixed
- 

## [0.1.33] - 2025-03-20

### Added
- Sticky ToolBar when scrolling through PDF content
  - ToolBar now remains fixed at the top of the viewport during scrolling
  - Improves accessibility by keeping annotation tools always visible
  - Added subtle shadow effect and smooth transitions
  - Enhanced readability with proper background and z-index

### Changed
- Improved ToolBar styling and structure
  - Better responsive behavior when viewport size changes
  - Fixed background color for consistent appearance
  - Added transition effects for smoother user experience

### Fixed
- 

## [0.1.32] - 2025-03-19

### Added
- New `onAnnotationsChange` prop to PdfAnnotator component
  - Enables parent components to easily track and maintain the full annotations array
  - Provides real-time updates whenever annotations are created, updated, or deleted
  - Simplifies state management in parent components

### Changed
- Improved Tag Selection UI in AnnotationDetails component
  - Added max-height constraints to prevent overflow in viewport
  - Enhanced scrolling behavior for better user experience
  - Made tag containers scrollable for better space management
  - Added sticky header for better visual hierarchy
  - Implemented two-column layout when tag selector is open
    - Left column: Competência dropdown and Anotações textarea
    - Right column: Tag selection interface
    - Improves usability with better space utilization
    - Provides more room for both annotation content and tag selection

### Fixed
- Fixed annotation color not updating when changing category
  - Ensured color is properly updated in the annotation object when category changes
  - Added explicit color handling in the update flow
  - Enhanced color synchronization between categories and annotation rendering

## [0.1.31] - 2025-03-18

### Added
- Type exports for better TypeScript support
  - Added explicit exports for `PdfAnnotatorRef` type
  - Enhanced type safety across component interfaces

### Changed
- Major refactoring to improve type system
  - Replaced `ENEMCategory` and `CategoryType` with `CompetenciaInterface`
  - Updated components to use the new type definitions
  - Enhanced custom categories support throughout the codebase
- Improved project structure
  - Restructured exports for better code organization
  - Simplified root-level PdfAnnotator to be a re-export
  - Consistent import paths across components

### Removed
- Deprecated props that are no longer needed
  - Removed `availableTags` prop (using `customCategories` instead)
  - Removed `categoryColors` prop (colors now come from category items)
  - Simplified color handling across components

### Fixed
- Fixed import path issues that were causing build failures
- Enhanced type compatibility between `CustomCategory` and `CompetenciaInterface`

## [0.1.30] - 2025-03-18

### Fixed
- Fixed category selection bug that was reverting to the first category
  - Corrected issue where selecting a different category would revert to the default
  - Modified the category selection logic to respect user's choice
  - Updated ToolBar to display both ENEM and custom categories correctly
  - Enhanced the handling of customCategories in dropdown options

## [0.1.29] - 2025-03-16

### Changed
- Improved tag selection UI in the AnnotationDetails component
  - Selected tags now remain visible while browsing available tags
  - Added visual separation between selected tags and available tags
  - Enhanced the UI with a "Disponíveis" label for available tags
  - Tag selector now only appears when a category is selected
  - Available tags are now filtered based on the selected category

### Fixed
- Fixed tag filtering logic to match the selected category
  - Tags are now automatically filtered by competency number based on the selected category
  - Improved user experience by only showing relevant tags for each category
  - Automatically selects the correct competency when opening the tag selector

## [0.1.28] - 2025-03-18

### Added
- 

### Changed
- Improved tag selection UI in the AnnotationDetails component
  - Selected tags now remain visible while browsing available tags
  - Added visual separation between selected tags and available tags
  - Enhanced the UI with a "Disponíveis" label for available tags
  - Tag selector now only appears when a category is selected
  - Available tags are now filtered based on the selected category

### Fixed
- Fixed tag filtering logic to match the selected category
  - Tags are now automatically filtered by competency number based on the selected category
  - Improved user experience by only showing relevant tags for each category
  - Automatically selects the correct competency when opening the tag selector

## [0.1.27] - 2025-03-17

### Added
- Visual feedback for rectangle drawing
  - Added real-time preview when creating rectangle annotations
  - Dynamic dashed outline shows exact dimensions before committing
  - Consistent with the visual feedback already available for highlighting
- Thickness selector for drawing tools
  - Added a contextual thickness menu that appears when using drawing tools
  - Support for multiple thickness levels (1px, 2px, 4px, 8px, 12px)
  - Different default thicknesses per tool type (drawing, highlighting, rectangle)
  - Thickness settings persist during the annotation session
  - Visual feedback updates in real-time as thickness changes

### Changed
- 

### Fixed
- Restored selection tool button in the toolbar that was accidentally removed
  - Re-added the hand icon button for selecting annotations
  - Ensured proper button styling and hover effects
  - Maintained proper spacing between toolbar sections
- Fixed PDF rotation issue
  - Added rotation override to prevent PDFs from rendering upside-down
  - Ensures consistent orientation regardless of PDF metadata
  - Improves first-time rendering reliability

## [0.1.26] - 2025-03-17

### Added
- Enhanced zoom controls in the toolbar
  - Reset zoom button (percentage display) now fits PDF to viewport width
  - Improved user experience by making zoom reset match the fitToWidth behavior
  - Maintained backward compatibility with fallback to 1.0 scale

### Changed
- Temporarily commented out PIN annotation feature
  - Disabled PIN annotation creation and handling functions
  - Removed PIN case from annotation type color selection
  - PIN functionality can be re-enabled in a future release if needed
- Improved category selection behavior
  - Now automatically selects the first custom category by default
  - Falls back to the first ENEM category if no custom categories exist
  - No longer restricts the ToolBar to only ENEM categories
  - Fixed an issue with the scrolling panel by removing extra 'p-4' class

### Fixed
-

## [0.1.25] - 2024-07-16

### Fixed
- HIGHLIGHTING mode now works correctly with proper visual feedback
  - Fixed issue where highlight marks weren't being drawn while making free-form highlighting annotations
  - Added proper line caps and joins for a marker-like visual effect
  - Improved real-time preview rendering for marker highlighting
  - Fixed color handling for highlighting annotations

### Changed
- Temporarily commented out PIN annotation feature
  - Disabled PIN annotation creation and handling functions
  - Removed PIN case from annotation type color selection
  - PIN functionality can be re-enabled in a future release if needed
- Improved category selection behavior
  - Now automatically selects the first custom category by default
  - Falls back to the first ENEM category if no custom categories exist
  - No longer restricts the ToolBar to only ENEM categories
  - Fixed an issue with the scrolling panel by removing extra 'p-4' class

## [0.1.24] - 2024-07-16

### Added
- Enhanced tag management in the AnnotationDetails component
  - Added ability to add/remove tags from available tag lists
  - Implemented shadcn-inspired badge UI for tags
  - Added dropdown selector for tag categories
  - Made tags available for all annotation types, not just PIN annotations

### Changed
- Improved tag display with rounded-pill design for better visual distinction
- Tags now respect the selected category color for visual consistency

## [0.1.23] - 2024-07-16

### Added
- Version management scripts to automate release process
  - Added `scripts/increment-version.js` to automatically increment version numbers
  - Added npm scripts for patch, minor, and major version updates
  - Added combined scripts for version increment and publishing in one command
  - Created documentation in `scripts/README.md` with usage instructions

### Changed
- Improved developer workflow with automated versioning
  - Simplified release process with one-command publish scripts
  - Automatic CHANGELOG.md entry creation with templates

### Fixed
- No bug fixes in this release

## [0.1.22] - 2024-07-16

### Added
- New AnnotationMode.HIGHLIGHTING for free-form highlighting with marker-like effect
  - Added a new tool button with a marker icon
  - Highlighting has thicker strokes (10px) with rounded caps and joins for a smoother look
  - Uses translucent yellow color by default for a highlighting pen effect

### Changed
- Doubled the thickness of the drawing tool from 2px to 4px for better visibility

## [0.1.21] - 2024-07-16

### Added
- Auto-scaling feature to fit PDF to the width of the container
  - Added `fitToWidth` prop (defaults to `true`) which automatically scales the PDF to fit the container width
  - Recalculates scale on window resize to maintain proper fit
- Support for custom categories beyond the default ENEM categories
  - Added `customCategories` prop allowing users to define their own annotation categories
  - Each custom category has an ID, display name, and color
  - Fully integrated with all existing category-related features

### Fixed
- Bug where annotation details would lose category color information
  - Enhanced AnnotationDetails component to properly display category colors throughout the UI
  - Added color indicator for category selection
  - Applied category color to various UI elements (buttons, borders, etc.)
- Type issues related to custom categories implementation
  - Added TypeScript type guard to properly handle CategoryType values
  - Updated ToolBar component to work with both ENEMCategory and custom categories
  - Fixed type compatibility issues in component props to ensure type safety

## [0.1.20] - 2024-07-16

### Added
- Portuguese language support across all components

### Changed
- Translated all UI text from English to Portuguese:
  - `AnnotationDetails.tsx`: 
    - Translated dialog title to "Anotação"
    - Translated "Categoria", "Problemas", confirmation messages
    - Translated all button text (Cancelar, Salvar, Apagar, Editar)
  - `ToolBar.tsx`: 
    - Translated all tooltips and button labels
    - Changed "Page X of Y" to "Página X de Y"
    - Translated dropdown options (e.g., "Select Category" → "Selecionar Categoria")
    - Translated zoom controls text
  - `CommentPopup.tsx`:
    - Changed "Add a comment..." to "Adicionar um comentário..."
    - Changed "Cancel" to "Cancelar"
    - Changed "Save" to "Salvar"
  - `TextInputPopup.tsx`:
    - Changed "Enter your text here..." to "Digite seu texto aqui..."
    - Changed "Cancel" to "Cancelar"
    - Changed "Add Text" to "Adicionar Texto"
  - `PinPopup.tsx`:
    - Changed "Add Issue Pin" to "Adicionar Marcador"
    - Changed all form labels and button text to Portuguese
  - `PdfAnnotator.tsx`:
    - Changed console log message "Updating annotation" to "Atualizando anotação"

### Fixed
- No bug fixes in this release
