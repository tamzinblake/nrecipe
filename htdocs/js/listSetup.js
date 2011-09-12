function notNull (val) {
  return val ? val : ''
}

Ext.onReady(function () {
  var body = Ext.getBody()

  var ingredientRecord = Ext.data.Record.create(
    [ {name: 'ingId'                   , sortType: notNull}
    , {name: 'ingIngredientId'         , sortType: notNull}
    , {name: 'ingName'                 , sortType: notNull}
    , {name: 'ingDensity'              , sortType: notNull}
    , {name: 'ingDefaultUnitId'        , sortType: notNull}
    , {name: 'ingDefaultUnit'          , sortType: notNull}
    , {name: 'ingDefaultUnitConversion', sortType: notNull}
    , {name: 'ingDefaultUnitType'      , sortType: notNull}
    , {name: 'ingShopUnitId'           , sortType: notNull}
    , {name: 'ingShopUnit'             , sortType: notNull}
    , {name: 'ingShopUnitConversion'   , sortType: notNull}
    , {name: 'ingShopUnitType'         , sortType: notNull}
    , {name: 'ingUnitId'               , sortType: notNull}
    , {name: 'ingUnit'                 , sortType: notNull}
    , {name: 'ingUnitConversion'       , sortType: notNull}
    , {name: 'ingUnitType'             , sortType: notNull}
    , {name: 'ingAmount'               , sortType: notNull}
    ]
  )

  var recipeRecord = Ext.data.Record.create(
    [ {name: 'recId'    , sortType: notNull}
    , {name: 'recName'  , sortType: notNull}
    , {name: 'recAmount', sortType: notNull}
    ]
  )

  var shoppingRecord = Ext.data.Record.create(
    [ {name: 'shoId'                   , sortType: notNull}
    , {name: 'shoIngredientId'         , sortType: notNull}
    , {name: 'shoName'                 , sortType: notNull}
    , {name: 'shoDensity'              , sortType: notNull}
    , {name: 'shoDefaultUnitId'        , sortType: notNull}
    , {name: 'shoDefaultUnit'          , sortType: notNull}
    , {name: 'shoDefaultUnitConversion', sortType: notNull}
    , {name: 'shoDefaultUnitType'      , sortType: notNull}
    , {name: 'shoShopUnitId'           , sortType: notNull}
    , {name: 'shoShopUnit'             , sortType: notNull}
    , {name: 'shoShopUnitConversion'   , sortType: notNull}
    , {name: 'shoShopUnitType'         , sortType: notNull}
    , {name: 'shoUnitId'               , sortType: notNull}
    , {name: 'shoUnit'                 , sortType: notNull}
    , {name: 'shoUnitConversion'       , sortType: notNull}
    , {name: 'shoUnitType'             , sortType: notNull}
    , {name: 'shoAmount'               , sortType: notNull}
    ]
  )

  var ingredientReader = new Ext.data.JsonReader
    ( { root: 'rows'
      , totalProperty: 'totalcount'
      , id: 'ingId'
      }
    , ingredientRecord
    )

  var recipeReader = new Ext.data.JsonReader
    ( { root: 'rows'
      , totalProperty: 'totalcount'
      , id: 'recId'
      }
    , recipeRecord
    )

  var shoppingReader = new Ext.data.JsonReader
    ( { root: 'rows'
      , totalProperty: 'totalcount'
      , id: 'shoId'
      }
    , shoppingRecord
    )

  var ingredientStore = new Ext.data.Store(
    { proxy: new Ext.data.HttpProxy(
        { api: { read: '/nrecipe/lists/ingredients/list'
               }
        , method : 'post'
        }
      )
    , reader: ingredientReader
    , remoteSort: false
    , listeners: { exception: failureStore
                 }
    , sortInfo: { field: 'ingId'
                , direction: 'ASC'
                }
    }
  )

  var recipeStore = new Ext.data.Store(
    { proxy: new Ext.data.HttpProxy(
        { api: { read: '/nrecipe/lists/recipes/list'
               }
        , method : 'post'
        }
      )
    , reader: recipeReader
    , remoteSort: false
    , listeners: { exception: failureStore
                 }
    , sortInfo: { field: 'recId'
                , direction: 'ASC'
                }
    }
  )

  var shoppingStore = new Ext.data.Store(
    { proxy: new Ext.data.HttpProxy(
        { api: { read: '/nrecipe/lists/shopping/list'
               }
        , method : 'post'
        }
      )
    , reader: shoppingReader
    , remoteSort: false
    , listeners: { exception: failureStore
                 }
    , sortInfo: { field: 'shoId'
                , direction: 'ASC'
                }
    }
  )

  var ingredientEditWindow = ingredientListWindowFactory(
    { getSelected: function () {
        return ingredientStore.selectedRecord
      }
    , loadStore:ingredientLoadStore
    }
  )

  var recipeEditWindow = recipeListWindowFactory(
    { getSelected: function () {
        return recipeStore.selectedRecord
      }
    , loadStore:recipeLoadStore
    }
  )

  var ingredientAddButton = new Ext.Button(
    { text: 'Add ingredient'
    , listeners:
        { click: function () {
            ingredientEditWindow.openAdd()
          }
        }
    }
  )

  var recipeAddButton = new Ext.Button(
    { text: 'Add recipe'
    , listeners:
        { click: function () {
            recipeEditWindow.openAdd()
          }
        }
    }
  )

  function ingredientDoEdit () {
    if (ingredientStore.selectedRecord) {
      ingredientEditWindow.openEdit()
    }
  }

  function recipeDoEdit () {
    if (recipeStore.selectedRecord) {
      recipeEditWindow.openEdit()
    }
  }

  var ingredientEditButton = new Ext.Button(
    { text: 'Change amount'
    , disabled: true
    , listeners: { click: ingredientDoEdit
                 }
    }
  )

  var recipeEditButton = new Ext.Button(
    { text: 'Change amount'
    , disabled: true
    , listeners: { click: recipeDoEdit
                 }
    }
  )

  var ingredientDeleteButton = new Ext.Button(
    { text: 'Delete'
    , disabled: true
    }
  )

  ingredientDeleteButton.on('click', function () {
    if (ingredientStore.selectedRecord) {
      Ext.Ajax.request(
        { url: '/nrecipe/lists/ingredients/delete'
        , success: function (response,options) {
            if (successAjax(response,options)) {
              ingredientLoadStore()
            }
          }
        , failure: failureAjax
        , params: { ingId: ingredientStore.selectedRecord.data.ingId
                  }
        }
      )
    }
    ingredientClearSelection()
  } )

  var recipeDeleteButton = new Ext.Button(
    { text: 'Delete'
    , disabled: true
    }
  )

  recipeDeleteButton.on('click', function () {
    if (recipeStore.selectedRecord) {
      Ext.Ajax.request(
        { url: '/nrecipe/lists/recipes/delete'
        , success: function (response,options) {
            if (successAjax(response,options)) {
              recipeLoadStore()
            }
          }
        , failure: failureAjax
        , params: { recId: recipeStore.selectedRecord.data.recId
                  }
        }
      )
    }
    recipeClearSelection()
  } )

  function ingredientClearSelection () {
    if (ingredientGrid) {
      ingredientGrid.getSelectionModel().clearSelections()
      ingredientGrid.getSelectionModel().fireEvent('rowdeselect')
    }
    ingredientStore.selectedRecord = null
  }

  function recipeClearSelection () {
    if (recipeGrid) {
      recipeGrid.getSelectionModel().clearSelections()
      recipeGrid.getSelectionModel().fireEvent('rowdeselect')
    }
    recipeStore.selectedRecord = null
  }

  function shoppingClearSelection () {
    if (shoppingGrid) {
      shoppingGrid.getSelectionModel().clearSelections()
      shoppingGrid.getSelectionModel().fireEvent('rowdeselect')
    }
    shoppingStore.selectedRecord = null
  }

  var ingredientTitleBar = new Ext.Toolbar(
    { autoHeight: true
    , autoWidth: true
    , items:
        [ '<a href="/nrecipe/lists/view">Back to list page</a>'
        , '-'
        , ingredientAddButton
        , '-'
        , ingredientEditButton
        , '-'
        , ingredientDeleteButton
        , '-'
        , '->'
        , '-'
        , { xtype: 'tbtext'
          , text: 'Ingredients for ' + listName
          }
        , '-'
        ]
    }
  )

  var recipeTitleBar = new Ext.Toolbar(
    { autoHeight: true
    , autoWidth: true
    , items:
        [ '<a href="/nrecipe/lists/view">Back to list page</a>'
        , '-'
        , recipeAddButton
        , '-'
        , recipeEditButton
        , '-'
        , recipeDeleteButton
        , '-'
        , '->'
        , '-'
        , { xtype: 'tbtext'
          , text: 'Recipes for ' + listName
          }
        , '-'
        ]
    }
  )

  function ingredientLoadStore () {
    ingredientStore.storeLoaded = false
    ingredientStore.load(
      { params: { listId: listId
                }
      , callback: function () {
          ingredientStore.storeLoaded = true
          shoppingLoadStore()
        }
      }
    )
  }

  function recipeLoadStore () {
    recipeStore.storeLoaded = false
    recipeStore.load(
      { params: { listId: listId
                }
      , callback: function () {
          recipeStore.storeLoaded = true
          shoppingLoadStore()
        }
      }
    )
  }

  function shoppingLoadStore () {
    shoppingStore.storeLoaded = false
    shoppingStore.load(
      { params: { listId: listId
                }
      , callback: function() {
          shoppingStore.storeLoaded = true
        }
      }
    )
  }

  var ingredientModel = new Ext.grid.ColumnModel(
    { columns:
        [ { header   : 'Id'
          , width  : 36
          , dataIndex: 'ingId'
          , sortable : true
          }
        , { header   : 'Name'
          , width  : 72
          , dataIndex: 'ingName'
          , sortable : true
          }
        , { header   : 'Amount'
          , width  : 160
          , dataIndex: 'ingAmount'
          , sortable : true
          }
        , { header   : 'Unit'
          , width  : 72
          , dataIndex: 'ingUnit'
          , sortable : true
          }
        ]
    , defaults: { renderer: 'htmlEncode'
                }
    }
  )

  var recipeModel = new Ext.grid.ColumnModel(
    { columns:
        [ { header   : 'Id'
          , width  : 36
          , dataIndex: 'recId'
          , sortable : true
          }
        , { header   : 'Name'
          , width  : 72
          , dataIndex: 'recName'
          , sortable : true
          }
        , { header   : 'Amount'
          , width  : 160
          , dataIndex: 'recAmount'
          , sortable : true
          }
        ]
    , defaults: {
        renderer: 'htmlEncode'
      }
    }
  )

  var shoppingModel = new Ext.grid.ColumnModel(
    { columns:
        [ { header   : 'Name'
          , width  : 72
          , dataIndex: 'shoName'
          , sortable : true
          }
        , { header   : 'Amount'
          , width  : 160
          , dataIndex: 'shoAmount'
          , sortable : true
          }
        , { header   : 'Unit'
          , width  : 72
          , dataIndex: 'shoShopUnit'
          , sortable : true
          }
        ]
    , defaults: {
        renderer: 'htmlEncode'
      }
    }
  )

  var ingredientGridSelectionModel = new Ext.grid.RowSelectionModel(
    { singleSelect: true
    , listeners:
        { rowdeselect: function (sm,rowIndex,r) {
            ingredientStore.selectedRecord = null
            ingredientDeleteButton.disable()
            ingredientEditButton.disable()
          }
        , rowselect: function (sm,rowIndex,r) {
            ingredientStore.selectedRecord = r
            if (ingredientStore.selectedRecord) {
              ingredientDeleteButton.enable()
              ingredientEditButton.enable()
            }
          }
        }
    }
  )

  var recipeGridSelectionModel = new Ext.grid.RowSelectionModel(
    { singleSelect: true
    , listeners:
        { rowdeselect: function (sm,rowIndex,r) {
            recipeStore.selectedRecord = null
            recipeDeleteButton.disable()
            recipeEditButton.disable()
          }
        , rowselect: function (sm,rowIndex,r) {
            recipeStore.selectedRecord = r
            if (recipeStore.selectedRecord) {
              recipeDeleteButton.enable()
              recipeEditButton.enable()
            }
          }
        }
    }
  )

  var shoppingGridSelectionModel = new Ext.grid.RowSelectionModel(
    { singleSelect: true
    , listeners:
        { rowdeselect: function (sm,rowIndex,r) {
            shoppingStore.selectedRecord = null
          }
        , rowselect: function (sm,rowIndex,r) {
            shoppingStore.selectedRecord = r
            if (shoppingStore.selectedRecord) {
            }
          }
        }
    }
  )

  var ingredientGrid = new Ext.grid.GridPanel(
    { title: 'Ingredients on this list'
    , store: ingredientStore
    , sm: ingredientGridSelectionModel
    , cm: ingredientModel
    , stripeRows: true
    , enableHdMenu: false
    , tbar: ingredientTitleBar
    , enableColumnHide : false
    , stateful   : true
    , stateId  : 'ingredientGridState'
    , listeners: { rowdblclick: ingredientDoEdit
                 }
    , viewConfig:
        { forceFit: true
        , getRowClass: function(record,rowIndex,rp,ds) {
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

  ingredientLoadStore()

  var recipeGrid = new Ext.grid.GridPanel(
    { title: 'Recipes on "' + listName + '" list'
    , store: recipeStore
    , sm: recipeGridSelectionModel
    , cm: recipeModel
    , stripeRows: true
    , enableHdMenu: false
    , tbar: recipeTitleBar
    , enableColumnHide : false
    , stateful   : true
    , stateId  : 'recipeGridState'
    , listeners: { rowdblclick: recipeDoEdit
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
  recipeLoadStore()

  var shoppingGrid = new Ext.grid.GridPanel(
    { title: 'Shopping list'
    , store: shoppingStore
    , sm: shoppingGridSelectionModel
    , cm: shoppingModel
    , stripeRows: true
    , enableHdMenu: false
    , enableColumnHide : false
    , stateful   : true
    , stateId  : 'shoppingGridState'
    , listeners: {}
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
  shoppingLoadStore()

  var subPanel = new Ext.Panel(
    { layout: 'accordion'
    , region: 'center'
    , title: listName
    , items: [ recipeGrid
             , ingredientGrid
             , shoppingGrid
             ]
    }
  )

  var viewport = new Ext.Viewport(
    { layout: 'border'
    , autoHeight: true
    , autoWidth: true
    , renderTo: body
    , items: [subPanel]
    }
  )

  viewport.render()
} )

function recipeListWindowFactory (config) { with (config) {
  Ext.QuickTips.init()

  var comboRecord = new Ext.data.Record.create(
    [ { name: 'description', mapping: 0 }
    ]
  )

  var recipeReader = new Ext.data.JsonReader(
    { totalProperty: 'totalcount'
    , root: 'rows'
    }
  , comboRecord
  )

  var recipeStore = new Ext.data.Store(
    { proxy: new Ext.data.HttpProxy(
        { url: '/nrecipe/recipes/search'
        , method : 'post'
        }
      )
    , baseParams: { searchAnywhere: true
                  }
    , listeners: { exception: failureStore
                 }
    , reader: recipeReader
    }
  )

  var recipeCombo = new AddComboBox(
    { store: recipeStore
    , displayField: 'description'
    , valueField: 'description'
    , hiddenName: 'recName'
    , triggerAction: 'query'
    , minChars: 0
    , anchor:'100%'
    , mode:'remote'
    , id: 'recRecipeId'
    , fieldLabel: 'Recipe'
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
        [ { id: 'recId'
          , xtype: 'hidden'
          }
        , recipeCombo
        , { id: 'recAmount'
          , fieldLabel: 'Amount'
          , xtype: 'numberfield'
          , allowDecimals: true
          , allowNegative: false
          , anchor: '100%'
          }
        ]
    }
  )

  config = config || {}
  config.width = 550
  config.height = 200
  config.fieldSet = fieldSet
  config.route = 'lists/recipes/'

  var editWindow = genericWindowFactory(config)

  return editWindow
} }

function ingredientListWindowFactory (config) { with (config) {
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
    , hiddenName: 'ingUnit'
    , triggerAction: 'query'
    , minChars: 0
    , anchor:'100%'
    , mode:'remote'
    , id: 'ingUnitId'
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
    , hiddenName: 'ingName'
    , triggerAction: 'query'
    , minChars: 0
    , anchor:'100%'
    , mode:'remote'
    , id: 'ingIngredientId'
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
        [ { id: 'ingId'
          , xtype: 'hidden'
          }
        , ingredientCombo
        , { id: 'ingAmount'
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


  var editWindow = new Ext.Window(
    { width: 550
    , height: 200
    , title: 'Edit'
    , y: 25
    , manager: userWindowGroup
    , modal: true
    , layout: 'fit'
    , closeAction: 'hide'
    , items: editPanel
    , openAdd: function () {
        editWindow.fireEvent('goLoading','goAdding')
      }
    , openEdit: function () {
        editWindow.fireEvent('goLoading','goEditing')
      }
    }
  )

  config = config || {}
  config.width = 550
  config.height = 200
  config.fieldSet = fieldSet
  config.route = 'lists/ingredients/'

  return editWindow
} }
