// TiptapEditor.jsx
import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { createLowlight } from "lowlight";

// ✅ Explicitly include lists
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";

// MUI
import {
  Box,
  IconButton,
  Divider,
  Select,
  MenuItem,
  Tooltip,
} from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";

const lowlight = createLowlight();

const TiptapEditor = ({ value, onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // disable code blocks only
      }),
      BulletList,
      OrderedList,
      ListItem,
      Underline,
      Link.configure({ openOnClick: true, autolink: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      CodeBlockLowlight.configure({ lowlight }),
      Highlight,
      Color,
      TextStyle,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[350px] rounded-lg border border-gray-300 p-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const headingLevel =
    (editor.isActive("heading", { level: 1 }) && "h1") ||
    (editor.isActive("heading", { level: 2 }) && "h2") ||
    (editor.isActive("heading", { level: 3 }) && "h3") ||
    "p";

  const handleStyleChange = (e) => {
    const v = e.target.value;
    if (!editor) return;

    if (v === "p") editor.chain().focus().setParagraph().run();
    else if (v === "h1") editor.chain().focus().setHeading({ level: 1 }).run();
    else if (v === "h2") editor.chain().focus().setHeading({ level: 2 }).run();
    else if (v === "h3") editor.chain().focus().setHeading({ level: 3 }).run();
    else editor.chain().focus().setParagraph().run();
  };

  const active = (cond) => (cond ? "bg-gray-200" : "");

  return (
    <Box className="rounded-lg border border-gray-300">
      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          gap: 0.5,
          alignItems: "center",
          p: 1,
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#fafafa",
        }}
      >
        {/* Style dropdown */}
        <Select
          size="small"
          value={headingLevel}
          onChange={handleStyleChange}
          sx={{ mr: 1, minWidth: 110 }}
        >
          <MenuItem value="p">Normal</MenuItem>
          <MenuItem value="h1">H1</MenuItem>
          <MenuItem value="h2">H2</MenuItem>
          <MenuItem value="h3">H3</MenuItem>
        </Select>

        {/* Text styles */}
        <Tooltip title="Bold">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={active(editor.isActive("bold"))}
          >
            <FormatBoldIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Italic">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={active(editor.isActive("italic"))}
          >
            <FormatItalicIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Underline">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={active(editor.isActive("underline"))}
          >
            <FormatUnderlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Strikethrough">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={active(editor.isActive("strike"))}
          >
            <StrikethroughSIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />

        {/* Lists */}
        <Tooltip title="Bullet List">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={active(editor.isActive("bulletList"))}
          >
            <FormatListBulletedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Numbered List">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={active(editor.isActive("orderedList"))}
          >
            <FormatListNumberedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />

        {/* Color picker */}
        <Box sx={{ display: "flex", alignItems: "center", ml: 1, mr: 1 }}>
          <input
            type="color"
            onInput={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
            value={editor.getAttributes("textStyle").color || "#000000"}
            title="Text color"
            style={{
              width: 25,
              height: 25,
              border: "2px solid #888",
              borderRadius: 8,
              background: "transparent",
              cursor: "pointer",
              boxShadow: "0 0 4px #aaa",
            }}
          />
        </Box>

        <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />

        {/* Alignment */}
        <Tooltip title="Align Left">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={active(editor.isActive({ textAlign: "left" }))}
          >
            <FormatAlignLeftIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Align Center">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={active(editor.isActive({ textAlign: "center" }))}
          >
            <FormatAlignCenterIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Align Right">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={active(editor.isActive({ textAlign: "right" }))}
          >
            <FormatAlignRightIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Justify">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={active(editor.isActive({ textAlign: "justify" }))}
          >
            <FormatAlignJustifyIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />

        {/* Undo/Redo */}
        <Tooltip title="Undo">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().undo().run()}
          >
            <UndoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Redo">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().redo().run()}
          >
            <RedoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Editable content */}
      <EditorContent editor={editor} />

      {placeholder && !value && (
        <span className="block text-xs text-gray-400 px-3 pb-2">
          {placeholder}
        </span>
      )}
    </Box>
  );
};

export default TiptapEditor;





// // TiptapEditor.jsx
// import React, { useEffect } from "react";
// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import Underline from "@tiptap/extension-underline";
// import Link from "@tiptap/extension-link";
// import TextAlign from "@tiptap/extension-text-align";
// import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
// import Highlight from "@tiptap/extension-highlight";
// import Color from "@tiptap/extension-color";
// // import { TextStyle } from "@tiptap/extension-text-style";
// import { TextStyle } from "@tiptap/extension-text-style";
// import { createLowlight } from "lowlight";
// import PaletteIcon from "@mui/icons-material/Palette";

// // MUI toolbar UI
// import {
//   Box,
//   IconButton,
//   Divider,
//   Select,
//   MenuItem,
//   Tooltip,
// } from "@mui/material";
// import FormatBoldIcon from "@mui/icons-material/FormatBold";
// import FormatItalicIcon from "@mui/icons-material/FormatItalic";
// import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
// import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
// // Removed unused CodeIcon
// import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
// import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
// import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
// // Removed unused HorizontalRuleIcon
// // Removed unused LinkIcon
// // Removed unused LinkOffIcon
// import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
// import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
// import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
// import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
// import UndoIcon from "@mui/icons-material/Undo";
// import RedoIcon from "@mui/icons-material/Redo";

// // lowlight for code block highlighting (language autodetect)
// const lowlight = createLowlight();

// const TiptapEditor = ({ value, onChange, placeholder }) => {
//   const editor = useEditor({
//     extensions: [
//       StarterKit.configure({ codeBlock: false }),
//       Underline,
//       Link.configure({ openOnClick: true, autolink: true }),
//       TextAlign.configure({ types: ["heading", "paragraph"] }),
//       CodeBlockLowlight.configure({ lowlight }),
//       Highlight,
//       Color,
//       TextStyle,
//     ],
//     content: value || "",
//     editorProps: {
//       attributes: {
//         class:
//           "min-h-[350px] rounded-lg border border-gray-300 p-3 focus:outline-none", // style the editable area
//       },
//     },

//     onUpdate: ({ editor }) => onChange(editor.getHTML()),
//   });

//   useEffect(() => {
//     if (editor && value !== editor.getHTML()) {
//       editor.commands.setContent(value || "", false);
//     }
//   }, [value, editor]);

//   if (!editor) return null;

//   const headingLevel =
//     (editor.isActive("heading", { level: 1 }) && "h1") ||
//     (editor.isActive("heading", { level: 2 }) && "h2") ||
//     (editor.isActive("heading", { level: 3 }) && "h3") ||
//     "p";

//   const handleStyleChange = (e) => {
//     const v = e.target.value;
//     if (!editor) return;

//     if (v === "p") editor.chain().focus().setParagraph().run();
//     else if (v === "h1") editor.chain().focus().setHeading({ level: 1 }).run();
//     else if (v === "h2") editor.chain().focus().setHeading({ level: 2 }).run();
//     else if (v === "h3") editor.chain().focus().setHeading({ level: 3 }).run();
//     else editor.chain().focus().setParagraph().run();
//   };

//   // const handleStyleChange = (e) => {
//   //   const v = e.target.value;
//   //   if (!editor) return;

//   //   const c = editor.chain().focus();

//   //   switch (v) {
//   //     case "p":
//   //       c.setParagraph().run();
//   //       break;
//   //     case "h1":
//   //       c.toggleHeading({ level: 1 }).run();
//   //       break;
//   //     case "h2":
//   //       c.toggleHeading({ level: 2 }).run();
//   //       break;
//   //     case "h3":
//   //       c.toggleHeading({ level: 3 }).run();
//   //       break;
//   //     default:
//   //       c.setParagraph().run();
//   //   }
//   // };

//   // Removed unused setLinkPrompt

//   const active = (cond) => (cond ? "bg-gray-200" : "");

//   return (
//     <Box className="rounded-lg border border-gray-300">
//       {/* Toolbar */}
//       <Box
//         sx={{
//           display: "flex",
//           gap: 0.5,
//           alignItems: "center",
//           p: 1,
//           borderBottom: "1px solid #e5e7eb",
//           backgroundColor: "#fafafa",
//         }}
//       >
//         {/* Style dropdown: Normal / H1 / H2 / H3 */}
//         <Select
//           size="small"
//           value={headingLevel}
//           onChange={handleStyleChange}
//           sx={{ mr: 1, minWidth: 110 }}
//         >
//           <MenuItem value="p">Normal</MenuItem>
//           <MenuItem value="h1">H1</MenuItem>
//           <MenuItem value="h2">H2</MenuItem>
//           <MenuItem value="h3">H3</MenuItem>
//         </Select>

//         <Tooltip title="Bold">
//           <IconButton
//             size="small"
//             onClick={() => editor.chain().focus().toggleBold().run()}
//             className={active(editor.isActive("bold"))}
//           >
//             <FormatBoldIcon fontSize="small" />
//           </IconButton>
//         </Tooltip>
//         <Tooltip title="Italic">
//           <IconButton
//             size="small"
//             onClick={() => editor.chain().focus().toggleItalic().run()}
//             className={active(editor.isActive("italic"))}
//           >
//             <FormatItalicIcon fontSize="small" />
//           </IconButton>
//         </Tooltip>
//         <Tooltip title="Underline">
//           <IconButton
//             size="small"
//             onClick={() => editor.chain().focus().toggleUnderline().run()}
//             className={active(editor.isActive("underline"))}
//           >
//             <FormatUnderlinedIcon fontSize="small" />
//           </IconButton>
//         </Tooltip>
//         <Tooltip title="Strikethrough">
//           <IconButton
//             size="small"
//             onClick={() => editor.chain().focus().toggleStrike().run()}
//             className={active(editor.isActive("strike"))}
//           >
//             <StrikethroughSIcon fontSize="small" />
//           </IconButton>
//         </Tooltip>

//         <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />

//         <Tooltip title="Bullet List">
//           <IconButton
//             size="small"
//             onClick={() => editor.chain().focus().toggleBulletList().run()}
//             className={active(editor.isActive("bulletList"))}
//           >
//             <FormatListBulletedIcon fontSize="small" />
//           </IconButton>
//         </Tooltip>
//         <Tooltip title="Numbered List">
//           {/* Removed Strikethrough */}
//           <IconButton
//             size="small"
//             onClick={() => editor.chain().focus().toggleBlockquote().run()}
//             className={active(editor.isActive("blockquote"))}
//           >
//             <FormatListNumberedIcon fontSize="small" />
//           </IconButton>
//         </Tooltip>

//         {/* Color picker moved here instead of code/code block */}
//         <Box sx={{ display: "flex", alignItems: "center", ml: 1, mr: 1 }}>
//           {/* <PaletteIcon sx={{ fontSize: 32, mr: 1 }} /> */}
//           <input
//             type="color"
//             onInput={(e) =>
//               editor.chain().focus().setColor(e.target.value).run()
//             }
//             value={editor.getAttributes("textStyle").color || "#000000"}
//             title="Text color"
//             style={{
//               width: 25,
//               height: 25,
//               border: "2px solid #888",
//               borderRadius: 8,
//               background: "transparent",
//               cursor: "pointer",
//               boxShadow: "0 0 4px #aaa",
//             }}
//           />
//         </Box>

//         {/* Removed Highlight button */}

//         <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />

//         <Tooltip title="Align Left">
//           <IconButton
//             size="small"
//             onClick={() => editor.chain().focus().setTextAlign("left").run()}
//             className={active(editor.isActive({ textAlign: "left" }))}
//           >
//             <FormatAlignLeftIcon fontSize="small" />
//           </IconButton>
//         </Tooltip>
//         <Tooltip title="Align Center">
//           <IconButton
//             size="small"
//             onClick={() => editor.chain().focus().setTextAlign("center").run()}
//             className={active(editor.isActive({ textAlign: "center" }))}
//           >
//             <FormatAlignCenterIcon fontSize="small" />
//           </IconButton>
//         </Tooltip>
//         <Tooltip title="Align Right">
//           <IconButton
//             size="small"
//             onClick={() => editor.chain().focus().setTextAlign("right").run()}
//             className={active(editor.isActive({ textAlign: "right" }))}
//           >
//             <FormatAlignRightIcon fontSize="small" />
//           </IconButton>
//         </Tooltip>
//         <Tooltip title="Justify">
//           <IconButton
//             size="small"
//             onClick={() => editor.chain().focus().setTextAlign("justify").run()}
//             className={active(editor.isActive({ textAlign: "justify" }))}
//           >
//             <FormatAlignJustifyIcon fontSize="small" />
//           </IconButton>
//         </Tooltip>

//         <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />

//         <Tooltip title="Undo">
//           <IconButton
//             size="small"
//             onClick={() => editor.chain().focus().undo().run()}
//           >
//             <UndoIcon fontSize="small" />
//           </IconButton>
//         </Tooltip>
//         <Tooltip title="Redo">
//           <IconButton
//             size="small"
//             onClick={() => editor.chain().focus().redo().run()}
//           >
//             <RedoIcon fontSize="small" />
//           </IconButton>
//         </Tooltip>
//       </Box>

//       {/* Editable content */}
//       <EditorContent editor={editor} />

//       {placeholder && !value && (
//         <span className="block text-xs text-gray-400 px-3 pb-2">
//           {placeholder}
//         </span>
//       )}
//     </Box>
//   );
// };

// export default TiptapEditor;
