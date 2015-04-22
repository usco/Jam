import React from 'react';
import {cells,editors,Table, sortColumn} from 'reactabular'
let BomTable = Table;


let BomView = React.createClass({
  getInitialState() {
    // bind context at getInitialState, provide name of field where to store the index
    // of edited cell and deal with received data
    var editable = cells.edit.bind(this, 'editedCell', (value, celldata, rowIndex, property) => {
        console.log("heres", rowIndex,property)
        /*var idx = findIndex(this.state.data, {
            id: celldata[rowIndex].id,
        });*/
        let idx  = celldata[rowIndex].id;
        this.state.data[idx][property] = value;
        //FIXME: we need to call some "actions" / do things differently if we want 
        //the correct changes to take place in the kernel/bom

        this.setState({
            data: this.state.data,
        });
    });

    return {
      columns: [
        {
          property: 'id',
          header: 'Id'
        },
        {
              property: 'name',
              header: 'Name',
              cell: [
                  editable({
                      editor: editors.input(),
                  }),
                  (name) => name
              ],
        },
        {
            property: 'qty',
            header: 'Qty',
        },
        {
            property: 'unit',
            header: 'Unit',
        },
        {
            property: 'version',
            header: 'version',
            cell: [
                editable({
                    editor: editors.input(),
                }),
                (version) => version
            ],
        }
      ],
      header: {
        onClick: (column) => {
            // reset edits
            this.setState({
                editedCell: null
            });

            sortColumn(
                this.state.columns,
                column,
                this.state.data,
                this.setState.bind(this)
            );
        },
      }
    }
  },

  componentWillReceiveProps(nextProps){
    if("data" in nextProps){
      this.state.data = nextProps.data;
    }
  },

  render() {
    let columns = this.state.columns|| [];
    let data    = this.state.data || this.props.data || [];
    let header  = this.state.header;

    return (
      <div className="BomView">
          <BomTable columns={columns} header={header} data={data} />
      </div>
    )
  }

});

export default BomView
