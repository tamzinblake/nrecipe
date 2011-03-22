function notNull (val) {
  return val ? val : ''
}

Ext.onReady(function () {
  var body = Ext.getBody()

  var Record = Ext.data.Record.create(
    [ {name: '_id'           , mapping: 0, sortType: notNull}
    , {name: 'name'          , mapping: 1, sortType: notNull}
    , {name: 'density'       , mapping: 2, sortType: notNull}
    , {name: 'defaultUnitId' , mapping: 3, sortType: notNull}
    , {name: 'defaultUnit'   , mapping: 4, sortType: notNull}
    , {name: 'unitId'        , mapping: 5, sortType: notNull}
    , {name: 'unit'          , mapping: 6, sortType: notNull}
    , {name: 'amount'        , mapping: 7, sortType: notNull}
    ]
  )

  var store = new Ext.data.JsonStore(
    { url: '/nrecipe/recipes/ingredients/list'
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
        { url: '/nrecipe/recipes/ingredients/remove'
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
        [ '<a href="/nrecipe/recipes/view">Back to recipe page</a>'
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
          , text: 'Ingredients for ' + recipeName
          }
        , '-'
        ]
    }
  )

  function loadStore () {
    store.storeLoaded = false
    store.load(
      { params: { recipeId: recipeId
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

function setupWindowFactory (config) { with (config) {
  Ext.QuickTips.init()

  var comboRecord = new Ext.data.Record.create(
    [ { name: 'description', mapping: 0 }
    ]
  )

  var unitReader = new Ext.data.JsonReader
    ( { totalProperty: 'totalcount'
      , root: 'rows'
      }
    , comboRecord
    )

  var unitStore = new Ext.data.Store(
    { proxy: new Ext.data.HttpProxy(
        { url: '/nrecipe/units/search'
        , method : 'post'
        }
      )
    , baseParams: { searchAnywhere: true
                  }
    , listeners: { exception: failureStore
                 }
    , reader: unitReader
    }
  )

  var unitCombo = new AddComboBox(
    { store: unitStore
    , displayField: 'description'
    , valueField: 'description'
    , hiddenName: 'unit'
    , triggerAction: 'query'
    , minChars: 0
    , anchor:'100%'
    , mode:'remote'
    , id: 'unitId'
    , fieldLabel: 'Units'
    }
  )

  var ingredientReader = new Ext.data.JsonReader
    ( { totalProperty: 'totalcount'
      , root: 'rows'
      }
    , comboRecord
    )

  var ingredientStore = new Ext.data.Store(
    { proxy: new Ext.data.HttpProxy(
        { url: '/nrecipe/ingredients/search'
        , method : 'post'
        }
      )
    , baseParams: { searchAnywhere: true
                  }
    , listeners: { exception: failureStore
                 }
    , reader: ingredientReader
    }
  )

  var ingredientCombo = new AddComboBox(
    { store: ingredientStore
    , displayField: 'description'
    , valueField: 'description'
    , hiddenName: 'name'
    , triggerAction: 'query'
    , minChars: 0
    , anchor:'100%'
    , mode:'remote'
    , id: 'ingredientId'
    , fieldLabel: 'Ingredient'
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
        , ingredientCombo
        , { id: 'amount'
          , fieldLabel: 'Amount'
          , xtype: 'numberfield'
          , allowDecimals: true
          , allowNegative: false
          , anchor: '100%'
          }
        , unitCombo
        ]
    }
  )

  config = config || {}
  config.width = 550
  config.height = 200
  config.fieldSet = fieldSet
  config.route = 'recipes/ingredients'

  editWindow = genericWindowFactory(config)

  return editWindow
} }
