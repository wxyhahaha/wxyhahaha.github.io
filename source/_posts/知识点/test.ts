interface TableData {
  userName: string;
  age: string;
}

interface TableColumn {
  /* 显示于列头文本 */
  label?: string;
  /** 对应列内容的字段名 */
  prop?: string; // userName  age
}
interface MyTableColumn<T> extends Omit<TableColumn, 'prop'> {
  prop?: keyof T; // userName  age
}

interface TableProps<T = any> {
  /* 省略其他 */
  tableColumn: MyTableColumn<T>[];
}

// 这样，在写 prop 的时候就会自动提示有哪些后端字段了
function createTable(): TableProps<TableData> {
  return {
    /* 省略其他配置 */
    tableColumn: [
      {
        label: '姓名',
        prop: 'userName',
      },
      {
        label: '年龄',
        prop: 'age',
      }
    ]
  }
}