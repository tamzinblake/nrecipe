function notNull (val) {
  return val ? val : ''
}

Ext.onReady(function () {
  var body = Ext.getBody()

  var ingredientRecord = Ext.data.Record.create(
    [ {name: 'ing_id'                     , sortType: notNull}
    , {name: 'ing_ingredient_id'          , sortType: notNull}
    , {name: 'ing_name'                   , sortType: notNull}
    , {name: 'ing_density'                , sortType: notNull}
    , {name: 'ing_default_unit_id'        , sortType: notNull}
    , {name: 'ing_default_unit'           , sortType: notNull}
    , {name: 'ing_default_unit_conversion', sortType: notNull}
    , {name: 'ing_default_unit_type'      , sortType: notNull}
    , {name: 'ing_shop_unit_id'           , sortType: notNull}
    , {name: 'ing_shop_unit'              , sortType: notNull}
    , {name: 'ing_shop_unit_conversion'   , sortType: notNull}
    , {name: 'ing_shop_unit_type'         , sortType: notNull}
    , {name: 'ing_unit_id'                , sortType: notNull}
    , {name: 'ing_unit'                   , sortType: notNull}
    , {name: 'ing_unit_conversion'        , sortType: notNull}
    , {name: 'ing_unit_type'              , sortType: notNull}
    , {name: 'ing_amount'                 , sortType: notNull}
    ]
  )

  var recipeRecord = Ext.data.Record.create(
    [ {name: 'rec_id'    , sortType: notNull}
    , {name: 'rec_name'  , sortType: notNull}
    , {name: 'rec_amount', sortType: notNull}
    ]
  )

  var shoppingRecord = Ext.data.Record.create(
    [ {name: 'sho_id'                     , sortType: notNull}
    , {name: 'sho_ingredient_id'          , sortType: notNull}
    , {name: 'sho_name'                   , sortType: notNull}
    , {name: 'sho_density'                , sortType: notNull}
    , {name: 'sho_default_unit_id'        , sortType: notNull}
    , {name: 'sho_default_unit'           , sortType: notNull}
    , {name: 'sho_default_unit_conversion', sortType: notNull}
    , {name: 'sho_default_unit_type'      , sortType: notNull}
    , {name: 'sho_shop_unit_id'           , sortType: notNull}
    , {name: 'sho_shop_unit'              , sortType: notNull}
    , {name: 'sho_shop_unit_conversion'   , sortType: notNull}
    , {name: 'sho_shop_unit_type'         , sortType: notNull}
    , {name: 'sho_unit_id'                , sortType: notNull}
    , {name: 'sho_unit'                   , sortType: notNull}
    , {name: 'sho_unit_conversion'        , sortType: notNull}
    , {name: 'sho_unit_type'              , sortType: notNull}
    , {name: 'sho_amount'                 , sortType: notNull}
    ]
  )

  var ingredientReader = new Ext.data.JsonReader
    ( { root: 'rows'
      , totalProperty: 'totalcount'
      , id: 'ing_id'
      }
    , ingredientRecord
    )

  var recipeReader = new Ext.data.JsonReader
    ( { root: 'rows'
      , totalProperty: 'totalcount'
      , id: 'rec_id'
      }
    , recipeRecord
    )

  var shoppingReader = new Ext.data.JsonReader
    ( { root: 'rows'
      , totalProperty: 'totalcount'
      , id: 'sho_id'
      }
    , shoppingRecord
    )

  var ingredientStore = new Ext.data.Store(
    { proxy: new Ext.data.HttpProxy(
        { api: { read: '/recipe/admin/lists/ingredient-list'
               }
        , method : 'post'
        }
      )
    , reader: ingredientReader
    , remoteSort: false
    , listeners: { exception: failure_store
                 }
    , sortInfo: { field: 'ing_id'
                , direction: 'ASC'
                }
    }
  )

  var recipeStore = new Ext.data.Store(
    { proxy: new Ext.data.HttpProxy(
        { api: { read: '/recipe/admin/lists/recipe-list'
               }
        , method : 'post'
        }
      )
    , reader: recipeReader
    , remoteSort: false
    , listeners: { exception: failure_store
                 }
    , sortInfo: { field: 'rec_id'
                , direction: 'ASC'
                }
    }
  )

  var shoppingStore = new Ext.data.Store(
    { proxy: new Ext.data.HttpProxy(
        { api: { read: '/recipe/admin/lists/shopping-list'
               }
        , method : 'post'
        }
      )
    , reader: shoppingReader
    , remoteSort: false
    , listeners: { exception: failure_store
                 }
    , sortInfo: { field: 'sho_id'
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
        { url: '/recipe/admin/lists/ingredient-delete'
        , success: function (response,options) {
            if (success_ajax(response,options)) {
              ingredientLoadStore()
            }
          }
        , failure: failure_ajax
        , params: { ing_id: ingredientStore.selectedRecord.data.ing_id
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
        { url: '/recipe/admin/lists/recipe-delete'
        , success: function (response,options) {
            if (success_ajax(response,options)) {
              recipeLoadStore()
            }
          }
        , failure: failure_ajax
        , params: { rec_id: recipeStore.selectedRecord.data.rec_id
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
        [ '<a href="/recipe/admin/lists/view">Back to list page</a>'
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
          , text: 'Ingredients for ' + list_name
          }
        , '-'
        ]
    }
  )

  var recipeTitleBar = new Ext.Toolbar(
    { autoHeight: true
    , autoWidth: true
    , items:
        [ '<a href="/recipe/admin/lists/view">Back to list page</a>'
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
          , text: 'Recipes for ' + list_name
          }
        , '-'
        ]
    }
  )

  function ingredientLoadStore () {
    ingredientStore.storeLoaded = false
    ingredientStore.load(
      { params: { list_id: list_id
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
      { params: { list_id: list_id
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
      { params: { list_id: list_id
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
          , dataIndex: 'ing_id'
          , sortable : true
          }
        , { header   : 'Name'
          , width  : 72
          , dataIndex: 'ing_name'
          , sortable : true
          }
        , { header   : 'Amount'
          , width  : 160
          , dataIndex: 'ing_amount'
          , sortable : true
          }
        , { header   : 'Unit'
          , width  : 72
          , dataIndex: 'ing_unit'
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
          , dataIndex: 'rec_id'
          , sortable : true
          }
        , { header   : 'Name'
          , width  : 72
          , dataIndex: 'rec_name'
          , sortable : true
          }
        , { header   : 'Amount'
          , width  : 160
          , dataIndex: 'rec_amount'
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
          , dataIndex: 'sho_name'
          , sortable : true
          }
        , { header   : 'Amount'
          , width  : 160
          , dataIndex: 'sho_amount'
          , sortable : true
          }
        , { header   : 'Unit'
          , width  : 72
          , dataIndex: 'sho_shop_unit'
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
    { title: 'Recipes on "' + list_name + '" list'
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
    , title: list_name
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
