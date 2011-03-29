var notNull = function (val) {
  return val ? val : ''
}

Ext.onReady(function () {
  var body = Ext.getBody()

  var Record = Ext.data.Record.create
    ( [ {name: '_id'       , sortType: notNull}
      , {name: 'name'      , sortType: notNull}
      , {name: 'type'      , sortType: notNull}
      , {name: 'conversion', sortType: notNull}
      , {name: 'created'   , sortType: notNull, convert: formatDate}
      ]
    )

  var store = new Ext.data.JsonStore
    ( { url: '/nrecipe/units/list'
      , fields: Record
      , remoteSort: true
      , root: 'rows'
      , totalProperty: 'totalcount'
      , idProperty: '_id'
      , listeners: { exception: failureStore
                   }
      , sortInfo : { field: '_id'
                   , direction: 'ASC'
                   }
      }
    )

  store.storeLoaded = false

  var editWindow = unitWindowFactory
    ( { getSelected: function () {
    return store.selectedRecord
        }
      , loadStore: loadStore
      }
    )

  var addButton = new Ext.Button(
    { text: 'New unit'
    , listeners: { click: editWindow.openAdd
                 }
    }
  )

  function doEdit () {
    if (store.selectedRecord) {
      editWindow.openEdit()
    }
  }

  var editButton = new Ext.Button
    ( { text: 'Edit unit'
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
        { url: '/nrecipe/units/remove'
        , success: function (response,options) {
            if (successAjax(response,options)) {
              loadStore()
            }
          }
        , failure: failureAjax
        , params:
          { _id: store.selectedRecord.data._id
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

  var pagingBar = new Ext.StatefulPagingToolbar
    ( { store: store
      , pageSize: 50
      , emptyMsg: 'no data to display'
      , displayInfo: true
      , prependButtons: true
      , stateId: 'pagingToolbarunits'
      , stateful: true
      , stateEvents: ['change','select']
      , listeners:
        { staterestore: function () {
            store.setBaseParam('start',this.cursor)
            loadStore()
          }
        , select: function () { //handles selects from the filterCombo
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
               , 'Unit browser'
               , '-'
               ]
      }
    )

  function loadStore () {
    store.storeLoaded = false
    store.load ( { callback: function () {
                     store.storeLoaded = true
                   }
                 }
               )
  }

  var model = new Ext.grid.ColumnModel
    ( { columns: [ { header   : 'Name'
                   , width    : 72
                   , dataIndex: 'name'
                   , sortable : true
                   }
                 , { header   : 'Type'
                   , width    : 72
                   , dataIndex: 'type'
                   , sortable : true
                   }
                 , { header   : 'Conversion'
                   , width    : 160
                   , dataIndex: 'conversion'
                   , sortable : true
                   }
                 ]
      , defaults: {
          renderer: 'htmlEncode'
        }
      }
    )

  var gridSelectionModel = new Ext.grid.RowSelectionModel
    ( { singleSelect: true
      , listeners: { rowdeselect: function (sm, rowIndex, r) {
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

  var grid = new Ext.grid.GridPanel
    ( { store: store
      , sm: gridSelectionModel
      , cm: model
      , region: 'center'
      , stripeRows: true
      , enableHdMenu: false
      , tbar: pagingBar
      , enableColumnHide : false
      , stateful   : true
      , stateId    : 'unitsGridState'
      , listeners: {
          rowdblclick: doEdit
        }
      , viewConfig: { forceFit: true
                    , getRowClass: function (record, rowIndex, rp, ds) {
                        return 'foo'
                      }
                    , templates:
                      { cell: new Ext.Template
                        ( '<td class="x-grid3-col x-grid3-cell '
                        + 'x-grid3-td-{id} '
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

  var viewport = new Ext.Viewport
    ( { layout: 'border'
      , autoHeight: true
      , autoWidth: true
      , renderTo: body
      , items: [grid]
      }
    )

  viewport.render()
} )

function unitWindowFactory(config){ with(config){
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
       , { id: 'type'
         , anchor: '100%'
         , fieldLabel: 'Type'
         }
       , { id: 'conversion'
         , anchor: '100%'
         , fieldLabel: 'Conversion'
         }
       ]
    }
  )

  config = config || {}
  config.width = 550
  config.height = 200
  config.fieldSet = fieldSet
  config.route = 'units'

  var editWindow = genericWindowFactory(config)

  return editWindow
} }
