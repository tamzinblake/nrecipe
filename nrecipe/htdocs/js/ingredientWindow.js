function ingredientWindowFactory (config) { with (config) {
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
        { url: '/recipe/admin/units/search'
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
    , fieldLabel: 'Default units'
    }
  )

  var shopUnitReader = new Ext.data.JsonReader
    ( { totalProperty: 'totalcount'
      , root: 'rows'
      }
    , comboRecord
    )

  var shopUnitStore = new Ext.data.Store(
    { proxy: new Ext.data.HttpProxy(
        { url: '/recipe/admin/units/search'
        , method : 'post'
        }
      )
      , baseParams: { searchAnywhere: true
                    }
      , listeners: { exception: failureStore
                   }
      , reader: shopUnitReader
    }
  )

  var shopUnitCombo = new AddComboBox(
    { store: shopUnitStore
    , displayField: 'description'
    , valueField: 'description'
    , hiddenName: 'shopUnit'
    , triggerAction: 'query'
    , minChars: 0
    , anchor:'100%'
    , mode:'remote'
    , id: 'shopUnitId'
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
