function notNull (val) {
  return val ? val : ''
}

Ext.onReady(function () {
  var body = Ext.getBody()

  var Record = Ext.data.Record.create(
    [ {name: '_id' , sortType: notNull}
    , {name: 'name', sortType: notNull}
    ]
  )

  var store = new Ext.data.JsonStore(
    { url: '/nrecipe/recipes/list'
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

  var editWindow = recipeWindowFactory(
    { getSelected: function () {
        return store.selectedRecord
      }
    , loadForm: function (form, record) {
        var doc = {}
        Ext.apply(doc, record.data)
        form.setValues(doc)
      }
    , loadStore: loadStore
    }
  )

  var addButton = new Ext.Button(
    { text: 'New recipe'
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
    { text: 'Edit'
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
        { url: '/nrecipe/recipes/delete'
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
    , stateId: 'pagingToolbarrecipes'
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
    , items:
        [ '<a href="/nrecipe">Back to menu</a>'
        , '-'
        , addButton
        , '-'
        , editButton
        , '-'
        , deleteButton
        , '-'
        , openButton
        , '-'
        , '->'
        , '-'
        , 'Recipe browser'
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
        [ { header   : 'Id'
          , width  : 36
          , dataIndex: '_id'
          , sortable : true
          }
        , { header   : 'Name'
          , width  : 72
          , dataIndex: 'name'
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
            openButton.disable()
          }
        , rowselect: function (sm,rowIndex,r) {
            store.selectedRecord = r
            if (store.selectedRecord) {
              deleteButton.enable()
              editButton.enable()
              openButton.enable()
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
    , stateful: true
    , stateId: 'recipeGridState'
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

function recipeWindowFactory (config) {
  Ext.QuickTips.init()

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
        ]
    }
  )

  config = config || {}
  config.width = 550
  config.height = 400
  config.fieldSet = fieldSet
  config.route = 'recipes'
  config.layout = 'border'
  config.item = ingredientBrowser()
  config.beforeSubmit = function(record, store) {
    record.data.ingredients = Ext.pluck(store.getRange(), 'data')
  }

  editWindow = genericWindowFactory(config)

  return editWindow

  function ingredientBrowser () {

    var Record = Ext.data.Record.create(
      [ {name: '_id'        , sortType: notNull}
      , {name: 'name'       , sortType: notNull}
      , {name: 'density'    , sortType: notNull}
      , {name: 'defaultUnit', sortType: notNull}
      , {name: 'unit'       , sortType: notNull}
      , {name: 'shopUnit'   , sortType: notNull}
      , {name: 'modified'   , sortType: notNull}
      ]
    )

    var store = new Ext.data.ArrayStore(
      { fields: Record
      , remoteSort: false
      , idProperty: '_id'
      , listeners: { exception: failureStore
                   }
      , sortInfo: { field: '_id'
                  , direction: 'ASC'
                  }
      , data : (config.getSelected && config.getSelected())
             ? (config.getSelected().ingredients || [])
             : []
      }
    )
    config.store = store

    var editWindow = setupWindowFactory(
      { getSelected: function () {
          return ( store.selectedRecord
                 ? store.selectedRecord
                 : new Record()
                 )
        }
      , loadForm: function (form, record) {
          var doc = {}
          Ext.apply(doc, record.data)
          doc.unit = doc.unit
                   ? doc.unit.name
                   : ''
          doc.ingredient = doc.ingredient
                         ? doc.ingredient.name
                         : ''
          form.setValues(doc)
        }
      , loadStore:loadStore
      , store: store
      , Record: Record
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
      { text: 'Edit'
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
        store.remove(selectedRecord)
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
          ]
      }
    )

    function loadStore () {
      grid.getView().refresh()
      store.storeLoaded = true
      console.log(store.getRange())
      // store.load(
      //   { callback: function () {
      //       store.storeLoaded = true
      //     }
      //   }
      // )
    }

    var model = new Ext.grid.ColumnModel(
      { columns:
          [ { header: 'Ingredient'
            , width: 72
            , dataIndex: 'ingredient'
            , sortable : true
            , renderer : nameRenderer
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
            , renderer : nameRenderer
            }
          ]
      , defaults: { renderer: 'htmlEncode'
                  }
      }
    )

    function nameRenderer (value,metaData,record,rowIndex,colIndex,store) {
      console.log(value, record)
      return value && value.name ? value.name : ''
    }

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
      , region: 'north'
      , split: true
      , height: 200
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

    return grid
  }

  function setupWindowFactory (config) {
    Ext.QuickTips.init()

    var unitRecord = new Ext.data.Record.create(
      [ {name: '_id'       , sortType: notNull}
      , {name: 'name'      , sortType: notNull}
      , {name: 'type'      , sortType: notNull}
      , {name: 'conversion', sortType: notNull}
      ]
    )

    var unitStore = new Ext.data.JsonStore(
      { url: '/nrecipe/units/list'
      , totalProperty: 'totalcount'
      , root: 'rows'
      , idProperty: '_id'
      , baseParams: { searchAnywhere: true
                    }
      , listeners: { exception: failureStore
                   }
      , fields: unitRecord
      }
    )

    var unitCombo = new AddComboBox(
      { store: unitStore
      , displayField: 'name'
      , valueField: '_id'
      , hiddenName: '__unit'
      , triggerAction: 'query'
      , minChars: 0
      , anchor:'100%'
      , mode:'remote'
      , id: 'unit'
      , fieldLabel: 'Unit'
      , listeners: { select: applyFactory('unit')
                   }
      }
    )

    function applyFactory(field) {
      return function (combo, record, index) {
        var doc = (config.getSelected() && config.getSelected().data)
                ? config.getSelected().data
                : {}
        doc[field] = record.data
      }
    }

    var ingredientRecord = Ext.data.Record.create(
      [ {name: '_id'        , sortType: notNull}
      , {name: 'name'       , sortType: notNull}
      , {name: 'density'    , sortType: notNull}
      , {name: 'defaultUnit', sortType: notNull}
      , {name: 'shopUnit'   , sortType: notNull}
      , {name: 'modified'   , sortType: notNull}
      ]
    )

    var ingredientStore = new Ext.data.JsonStore(
      { url: '/nrecipe/ingredients/list'
      , totalProperty: 'totalcount'
      , root: 'rows'
      , idProperty: '_id'
      , baseParams: { searchAnywhere: true
                    }
      , listeners: { exception: failureStore
                   }
      , fields: ingredientRecord
      }
    )

    var ingredientCombo = new AddComboBox(
      { store: ingredientStore
      , displayField: 'name'
      , valueField: '_id'
      , hiddenName: '__ingredient'
      , triggerAction: 'query'
      , minChars: 0
      , anchor:'100%'
      , mode:'remote'
      , id: 'ingredient'
      , fieldLabel: 'Ingredient'
      , listeners: { select: applyFactory('ingredient')
                   }
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
    config.height = 400
    config.fieldSet = fieldSet

    editWindow = localWindowFactory(config)

    return editWindow
  }
}
