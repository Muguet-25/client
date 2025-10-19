declare module 'react-tag-input' {
  export interface Tag {
    id: string;
    text: string;
  }

  export interface ReactTagsProps {
    tags: Tag[];
    delimiters: number[];
    handleDelete: (index: number) => void;
    handleAddition: (tag: Tag) => void;
    placeholder?: string;
    classNames?: {
      tags?: string;
      tagInput?: string;
      tagInputField?: string;
      selected?: string;
      tag?: string;
      remove?: string;
    };
  }

  export class WithContext extends React.Component<ReactTagsProps> {}
}
