import React, { useState } from "react";
import { Box, Collapse } from "@mui/material";
import FolderIcon from "@mui/icons-material/FolderOutlined";
import FolderOpenIcon from "@mui/icons-material/FolderOpenOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export type FileTreeNode = {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileTreeNode[];
};

const SANS = "'Inter', -apple-system, 'Segoe UI', sans-serif";
const TEXT_PAPER = "#F6F5F1";
const TEXT_PAPER_DIM = "#9C9B9E";
const CARD_ALT = "#222224";

type Props = {
  nodes: FileTreeNode[];
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
  depth?: number;
};

const RepoFileTree: React.FC<Props> = ({ nodes, selectedPath, onSelectFile, depth = 0 }) => (
  <Box>
    {nodes.map((node) => (
      <TreeItem key={node.path} node={node} selectedPath={selectedPath} onSelectFile={onSelectFile} depth={depth} />
    ))}
  </Box>
);

const TreeItem: React.FC<{
  node: FileTreeNode;
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
  depth: number;
}> = ({ node, selectedPath, onSelectFile, depth }) => {
  const [open, setOpen] = useState(depth === 0);

  if (node.type === "folder") {
    return (
      <Box>
        <Box
          onClick={() => setOpen((o) => !o)}
          sx={{
            display: "flex", alignItems: "center", gap: "4px",
            pl: `${8 + depth * 14}px`, pr: "8px", py: "6px",
            cursor: "pointer", borderRadius: "8px",
            color: TEXT_PAPER_DIM, fontFamily: SANS, fontSize: "12.5px",
            "&:hover": { background: CARD_ALT, color: TEXT_PAPER },
          }}
        >
          <ChevronRightIcon sx={{ fontSize: "14px", transform: open ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
          {open ? <FolderOpenIcon sx={{ fontSize: "15px" }} /> : <FolderIcon sx={{ fontSize: "15px" }} />}
          <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {node.name}
          </Box>
        </Box>
        <Collapse in={open} timeout={120}>
          {node.children && (
            <RepoFileTree nodes={node.children} selectedPath={selectedPath} onSelectFile={onSelectFile} depth={depth + 1} />
          )}
        </Collapse>
      </Box>
    );
  }

  const isSelected = selectedPath === node.path;
  return (
    <Box
      onClick={() => onSelectFile(node.path)}
      sx={{
        display: "flex", alignItems: "center", gap: "6px",
        pl: `${8 + depth * 14 + 18}px`, pr: "8px", py: "6px",
        cursor: "pointer", borderRadius: "8px",
        background: isSelected ? CARD_ALT : "transparent",
        color: isSelected ? TEXT_PAPER : TEXT_PAPER_DIM,
        fontFamily: SANS, fontSize: "12.5px", fontWeight: isSelected ? 600 : 400,
        "&:hover": { background: CARD_ALT, color: TEXT_PAPER },
      }}
    >
      <InsertDriveFileOutlinedIcon sx={{ fontSize: "14px", flexShrink: 0 }} />
      <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {node.name}
      </Box>
    </Box>
  );
};

export default RepoFileTree;