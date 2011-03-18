function notNull (val) {
  return val ? val : ''
}

Ext.onReady(function () {
  var body = Ext.getBody()

  var Record = Ext.data.Record.create(
    [ {name: 'id'             , mapping: 0, sortType: notNull}
    , {name: 'name'           , mapping: 1, sortType: notNull}
    , {name: 'density'        , mapping: 2, sortType: notNull}
    , {name: 'default_unit_id', mapping: 3, sortType: notNull}
    , {name: 'default_unit'   , mapping: 4, sortType: notNull}
    , {name: 'unit_id'        , mapping: 5, sortType: notNull}
    , {name: 'unit'           , mapping: 6, sortType: notNull}
    , {name: 'amount'         , mapping: 7, sortType: notNull}
    ]
  )

  var reader = new Ext.data.JsonReader
    ( { root: 'rows'
      , totalProperty: 'totalcount'
      , id: 'id'
      }
    , Record
  )

  var store = new Ext.data.Store(
    { proxy: new Ext.data.HttpProxy(
        { api: { read: '/recipe/admin/setup/list'
               }
        , method : 'post'
        }
      )
    , reader: reader
    , remoteSort: false
    , listeners: { exception: failure_store
                 }
    , sortInfo: { field: 'id'
                , direction: 'ASC'
                }
    }
  )

  var editWindow = setupWindowFactory(
    { getSelected: function () {
        return store.selectedRecord
      }
    , loadStore:loadStore
    }
  )

  var addButton = new Ext.Button(
    { text: 'Add ingredient'
    , listeners:
        { click: function () {
            editWindow.openAdd()
          }
        }
    }
  )

  function doEdit () {
    if (store.selectedRecord) {
      editWindow.openEdit()
    }
  }

  var editButton = new Ext.Button(
    { text: 'Edit amount'
    , disabled: true
    , listeners: { click: doEdit
                 }
    }
  )

  var deleteButton = new Ext.Button(
    { text: 'Delete'
    , disabled: true
    }
  )

  deleteButton.on('click', function () {
    if (store.selectedRecord) {
      Ext.Ajax.request(
        { url: '/recipe/admin/setup/delete'
        , success: function (response,options) {
            if (success_ajax(response,options)) {
              loadStore()
            }
          }
        , failure: failure_ajax
        , params: { id: store.selectedRecord.data.id
                  }
        }
      )
    }
    clearSelection()
  } )

  function clearSelection() {
    if (grid) {
      grid.getSelectionModel().clearSelections()
      grid.getSelectionModel().fireEvent('rowdeselect')
    }
    store.selectedRecord = null
  }

  var titleBar = new Ext.Toolbar(
    { autoHeight: true
    , autoWidth: true
    , items:
        [ '<a href="/recipe/admin/recipes/view">Back to recipe page</a>'
        , '-'
        , addButton
        , '-'
        , editButton
        , '-'
        , deleteButton
        , '-'
        , '->'
        , '-'
        , { xtype: 'tbtext'
          , text: 'Ingredients for ' + recipe_name
          }
        , '-'
        ]
    }
  )

  function loadStore () {
    store.storeLoaded = false
    store.load(
      { params: { recipe_id: recipe_id
                }
      , callback: function () {
          store.storeLoaded = true
        }
      }
    )
  }

  var model = new Ext.grid.ColumnModel(
    { columns:
        [ { header: 'Name'
          , width: 72
          , dataIndex: 'name'
          , sortable : true
          }
        , { header   : 'Amount'
          , width  : 160
          , dataIndex: 'amount'
          , sortable : true
          }
        , { header   : 'Unit'
          , width  : 72
          , dataIndex: 'unit'
          , sortable : true
          }
        ]
    , defaults: { renderer: 'htmlEncode'
                }
    }
  )

  var gridSelectionModel = new Ext.grid.RowSelectionModel(
    { singleSelect: true
    , listeners:
        { rowdeselect: function (sm,rowIndex,r) {
            store.selectedRecord = null
            deleteButton.disable()
            editButton.disable()
          }
        , rowselect: function (sm,rowIndex,r) {
            store.selectedRecord = r
            if (store.selectedRecord) {
              deleteButton.enable()
              editButton.enable()
            }
          }
        }
    }
  )

  var grid = new Ext.grid.GridPanel(
    { store: store
    , sm: gridSelectionModel
    , cm: model
    , region: 'center'
    , stripeRows: true
    , enableHdMenu: false
    , tbar: titleBar
    , enableColumnHide : false
    , stateful   : true
    , stateId  : 'setupGridState'
    , listeners: { rowdblclick: doEdit
                 }
    , viewConfig:
        { forceFit: true
        , getRowClass: function (record,rowIndex,rp,ds) {
            return 'foo'
          }
        , templates:
            { cell: new Ext.Template
                ( '<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} '
                + 'x-selectable {css}" style="{style}" '
                + 'tabIndex="0" {cellAttr}>'
                , '<div class="x-grid3-cell-inner x-grid3-col-{id}" '
                + '{attr}>{value}</div>'
                , '</td>'
                )
            }
        }
    }
  )

  loadStore()

  var viewport = new Ext.Viewport(
    { layout: 'border'
    , autoHeight: true
    , autoWidth: true
    , renderTo: body
    , items: [grid]
    }
  )

  viewport.render()
} )
