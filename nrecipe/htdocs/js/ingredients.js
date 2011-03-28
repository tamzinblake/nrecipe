function notNull (val) {
  return val ? val : ''
}

Ext.onReady(function () {
  var body = Ext.getBody()

  var Record = Ext.data.Record.create(
    [ {name: '_id'       , sortType: notNull}
    , {name: 'name'      , sortType: notNull}
    , {name: 'density'   , sortType: notNull}
    , {name: 'unitId'    , sortType: notNull}
    , {name: 'unit'      , sortType: notNull}
    , {name: 'shopUnitId', sortType: notNull}
    , {name: 'shopUnit'  , sortType: notNull}
    , {name: 'modified'  , sortType: notNull}
    ]
  )

  var store = new Ext.data.JsonStore(
    { url: '/nrecipe/ingredients/list'
    , fields: Record
    , remoteSort: true
    , root: 'rows'
    , totalProperty: 'totalcount'
    , idProperty: '_id'
    , listeners: { exception: failureStore
                 }
    , sortInfo: { field: '_id'
                , direction: 'ASC'
                }
    }
  )

  var editWindow = ingredientWindowFactory(
    { getSelected: function () {
        return store.selectedRecord
      }
    , loadStore:loadStore
    }
  )

  var addButton = new Ext.Button(
    { text: 'New ingredient'
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
    { text: 'Edit ingredient'
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
        { url: '/nrecipe/ingredients/remove'
        , success: function (response,options) {
            if (successAjax(response,options)) {
              loadStore()
            }
          }
        , failure: failureAjax
        , params: { _id: store.selectedRecord.data._id
                  }
        }
      )
    }
    clearSelection()
  } )

  function clearSelection () {
    if (grid) {
      grid.getSelectionModel().clearSelections()
      grid.getSelectionModel().fireEvent('rowdeselect')
    }
    store.selectedRecord = null
  }

  var pagingBar = new Ext.StatefulPagingToolbar(
    { store: store
    , pageSize: 50
    , emptyMsg: 'no data to display'
    , displayInfo: true
    , prependButtons: true
    , stateId: 'pagingToolbaringredients'
    , stateful: true
    , stateEvents: ['change','select']
    , listeners:
        { staterestore: function () {
            store.setBaseParam('start',this.cursor)
            loadStore()
          }
        , select: function () {
            //handles selects from the filterCombo
            this.cursor = 0
          }
        }
    , items: [ '<a href="/nrecipe">Back to menu</a>'
             , '-'
             , addButton
             , '-'
             , editButton
             , '-'
             , deleteButton
             , '-'
             , '->'
             , '-'
             , 'Ingredient browser'
             , '-'
             ]
    }
  )

  function loadStore () {
    store.storeLoaded = false
    store.load(
      { callback: function () {
          store.storeLoaded = true
        }
      }
    )
  }

  var model = new Ext.grid.ColumnModel(
    { columns:
        [ { header   : 'Name'
          , width  : 72
          , dataIndex: 'name'
          , sortable : true
          }
        , { header   : 'Density'
          , width  : 72
          , dataIndex: 'density'
          , sortable : true
          }
        , { header   : 'Default unit'
          , width  : 160
          , dataIndex: 'unit'
          , sortable : true
          }
        , { header   : 'Shopping List unit'
          , width  : 160
          , dataIndex: 'shopUnit'
          , sortable : true
          }
        , { header   : 'Modified'
          , width  : 160
          , dataIndex: 'modified'
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
        { rowdeselect: function (sm, rowIndex, r) {
            store.selectedRecord = null
            deleteButton.disable()
            editButton.disable()
          }
        , rowselect: function (sm, rowIndex, r) {
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
    , tbar: pagingBar
    , enableColumnHide : false
    , stateful : true
    , stateId : 'ingredientGridState'
    , listeners: { rowdblclick: doEdit
                 }
    , viewConfig:
        { forceFit: true
        , getRowClass: function(record, rowIndex, rp, ds) {
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

function ingredientWindowFactory (config) { with (config) {
  Ext.QuickTips.init()

  var comboRecord = new Ext.data.Record.create(
    [ 'name'
    , '_id'
    ]
  )

  var unitStore = new Ext.data.JsonStore(
    { url: '/nrecipe/units/search'
    , totalProperty: 'totalcount'
    , root: 'rows'
    , idProperty: '_id'
    , baseParams: { searchAnywhere: true
                  }
    , listeners: { exception: failureStore
                 }
    , fields: comboRecord
    }
  )

  var unitCombo = new AddComboBox(
    { store: unitStore
    , displayField: 'name'
    , valueField: '_id'
    , hiddenName: 'unitId'
    , triggerAction: 'query'
    , minChars: 0
    , anchor:'100%'
    , mode:'remote'
    , id: 'unit'
    , fieldLabel: 'Default units'
    }
  )

  var shopUnitStore = new Ext.data.JsonStore(
    { url: '/nrecipe/units/search'
    , totalProperty: 'totalcount'
    , root: 'rows'
    , idProperty: '_id'
    , baseParams: { searchAnywhere: true
                  }
    , listeners: { exception: failureStore
                 }
    , fields: comboRecord
    }
  )

  var shopUnitCombo = new AddComboBox(
    { store: shopUnitStore
    , displayField: 'name'
    , valueField: '_id'
    , hiddenName: 'shopUnitId'
    , triggerAction: 'query'
    , minChars: 0
    , anchor:'100%'
    , mode:'remote'
    , id: 'shopUnit'
    , fieldLabel: 'Shop units'
    }
  )

  var fieldSet = new Ext.form.FieldSet(
    { border: false
    , style: { marginTop: '10px'
             , marginBottom: '0px'
             , paddingBottom: '0px'
             }
    , layout: { type: 'form'
              , labelSeparator: ''
              }
    , defaults: { xtype: 'textfield'
                }
    , items:
        [ { id: '_id'
          , xtype: 'hidden'
          }
        , { id: 'name'
          , anchor: '100%'
          , fieldLabel: 'Name'
          }
        , { id: 'density'
          , fieldLabel: 'Density'
          , xtype: 'numberfield'
          , allowDecimals: true
          , allowNegative: false
          , anchor: '100%'
          }
        , unitCombo
        , shopUnitCombo
        ]
    }
  )

  config = config || {}
  config.width = 550
  config.height = 200
  config.fieldSet = fieldSet
  config.route = 'ingredients'

  editWindow = genericWindowFactory(config)

  return editWindow
} }
