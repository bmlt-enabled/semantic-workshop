<script lang="ts">
  import Node from './ServiceBodiesTreeNode.svelte';

  interface TreeNode {
    label: string;
    value: string;
    checked?: boolean;
    indeterminate?: boolean;
    expanded?: boolean;
    children?: TreeNode[];
  }

  interface Props {
    serviceBodies: { name: string; id: string; parent_id: string }[];
    onchange: () => void;
    selectedValues?: string[];
  }

  let { serviceBodies, onchange, selectedValues = $bindable([]) }: Props = $props();

  const treeMap: Record<string, TreeNode> = {};
  let trees = $derived.by(() => convertServiceBodiesToTreeNodes(serviceBodies));

  function convertServiceBodiesToTreeNodes(serviceBodies: { name: string; id: string; parent_id: string }[]): TreeNode[] {
    const nodeMap: Record<number, TreeNode> = {};
    const roots: TreeNode[] = [];

    serviceBodies.forEach((sb) => {
      nodeMap[parseInt(sb.id)] = {
        label: sb.name,
        value: sb.id,
        checked: selectedValues.includes(sb.id),
        expanded: true,
        children: []
      };
    });

    serviceBodies.forEach((sb) => {
      const node = nodeMap[parseInt(sb.id)];
      if (sb.parent_id && nodeMap[parseInt(sb.parent_id)]) {
        nodeMap[parseInt(sb.parent_id)].children!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  function rebuildChildren(node: TreeNode, checkAsParent = true) {
    if (node.children) {
      for (const child of node.children) {
        if (checkAsParent) child.checked = !!node.checked;
        rebuildChildren(child, checkAsParent);
      }
      node.indeterminate = node.children.some((c) => c.indeterminate) || (node.children.some((c) => !!c.checked) && node.children.some((c) => !c.checked));
    }
  }

  function rebuildTree(e: CustomEvent<{ node: TreeNode }>, checkAsParent: boolean = true): void {
    const node = e.detail.node;
    let parent = treeMap[node.label];
    rebuildChildren(node, checkAsParent);
    while (parent) {
      const allCheck = parent.children?.every((c) => !!c.checked);
      if (allCheck) {
        parent.indeterminate = false;
        parent.checked = true;
      } else {
        const haveCheckedOrIndetermine = parent.children?.some((c) => !!c.checked || c.indeterminate);
        if (haveCheckedOrIndetermine) {
          parent.indeterminate = true;
        } else {
          parent.indeterminate = false;
        }
      }
      parent = treeMap[parent.label];
    }
    // trees = [...trees];
    selectedValues = collectSelectedValues(trees);
    onchange();
  }

  function collectSelectedValues(trees: TreeNode[]): string[] {
    const selected: string[] = [];

    function traverse(node: TreeNode) {
      if (node.checked) {
        selected.push(node.value);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    }

    trees.forEach(traverse);
    return selected;
  }
</script>

<div>
  {#each trees as tree (tree)}
    <Node {tree} toggle={rebuildTree} />
  {/each}
</div>
