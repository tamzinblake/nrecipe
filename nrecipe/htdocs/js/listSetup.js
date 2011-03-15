var ingredientSelectedRecord;
var ingredientEditWindow;
var ingredientOper;
var ingredientStoreLoaded = false;
var recipeSelectedRecord;
var recipeEditWindow;
var recipeOper;
var recipeStoreLoaded = false;
var shoppingSelectedRecord;
var shoppingOper;
var shoppingStoreLoaded = false;
var notNull = function (val) {
  return val ? val : '';
};

Ext.onReady(function(){
    var body = Ext.getBody();

    var ingredientRecord = Ext.data.Record.create([
	{name: 'ing_id',              mapping: 0, type: 'int', sortType: notNull},
	{name: 'ing_ingredient_id',   mapping: 1, type: 'int', sortType: notNull},
	{name: 'ing_name',            mapping: 2, sortType: notNull},
	{name: 'ing_density',         mapping: 3, sortType: notNull},
	{name: 'ing_default_unit_id', mapping: 4, type: 'int', sortType: notNull},
	{name: 'ing_default_unit',    mapping: 5, sortType: notNull},
	{name: 'ing_default_unit_conversion', mapping: 6, sortType: notNull},
	{name: 'ing_default_unit_type', mapping: 7, sortType: notNull},
	{name: 'ing_shop_unit_id',    mapping: 8, type: 'int', sortType: notNull},
	{name: 'ing_shop_unit',       mapping: 9, sortType: notNull},
	{name: 'ing_shop_unit_conversion', mapping: 10, sortType: notNull},
	{name: 'ing_shop_unit_type',  mapping: 11, sortType: notNull},
	{name: 'ing_unit_id',         mapping: 12, type: 'int', sortType: notNull},
	{name: 'ing_unit',            mapping: 13, sortType: notNull},
	{name: 'ing_unit_conversion', mapping: 14, sortType: notNull},
	{name: 'ing_unit_type',       mapping: 15, sortType: notNull},
	{name: 'ing_amount',          mapping: 16, sortType: notNull}
    ]);

    var recipeRecord = Ext.data.Record.create([
	{name: 'rec_id',              mapping: 0, type: 'int', sortType: notNull},
	{name: 'rec_name',            mapping: 1, sortType: notNull},
	{name: 'rec_amount',          mapping: 2, sortType: notNull}
    ]);

    var shoppingRecord = Ext.data.Record.create([
	{name: 'sho_id',              mapping: 0, type: 'int', sortType: notNull},
	{name: 'sho_ingredient_id',   mapping: 1, type: 'int', sortType: notNull},
	{name: 'sho_name',            mapping: 2, sortType: notNull},
	{name: 'sho_density',         mapping: 3, sortType: notNull},
	{name: 'sho_default_unit_id', mapping: 4, type: 'int', sortType: notNull},
	{name: 'sho_default_unit',    mapping: 5, sortType: notNull},
	{name: 'sho_default_unit_conversion', mapping: 6, sortType: notNull},
	{name: 'sho_default_unit_type', mapping: 7, sortType: notNull},
	{name: 'sho_shop_unit_id',    mapping: 8, type: 'int', sortType: notNull},
	{name: 'sho_shop_unit',       mapping: 9, sortType: notNull},
	{name: 'sho_shop_unit_conversion', mapping: 10, sortType: notNull},
	{name: 'sho_shop_unit_type',  mapping: 11, sortType: notNull},
	{name: 'sho_unit_id',         mapping: 12, type: 'int', sortType: notNull},
	{name: 'sho_unit',            mapping: 13, sortType: notNull},
	{name: 'sho_unit_conversion', mapping: 14, sortType: notNull},
	{name: 'sho_unit_type',       mapping: 15, sortType: notNull},
	{name: 'sho_amount',          mapping: 16, sortType: notNull}
    ]);

    var ingredientReader = new Ext.data.JsonReader({
    	root: 'rows',
	totalProperty: 'totalcount',
	id: 'ing_id'
    }, ingredientRecord);

    var recipeReader = new Ext.data.JsonReader({
    	root: 'rows',
	totalProperty: 'totalcount',
	id: 'rec_id'
    }, recipeRecord);

    var shoppingReader = new Ext.data.JsonReader({
    	root: 'rows',
	totalProperty: 'totalcount',
	id: 'sho_id'
    }, shoppingRecord);

    var ingredientStore = new Ext.data.Store({
	proxy: new Ext.data.HttpProxy({
	    api: {
		read: '/recipe/admin/lists/ingredient-list'
	    },
	    method : 'post'
	}),
	reader: ingredientReader,
	remoteSort: false,
	listeners: {
	    exception: failure_store
	},
	sortInfo: {
	    field: 'ing_id',
	    direction: 'ASC'
	}
    });

    var recipeStore = new Ext.data.Store({
	proxy: new Ext.data.HttpProxy({
	    api: {
		read: '/recipe/admin/lists/recipe-list'
	    },
	    method : 'post'
	}),
	reader: recipeReader,
	remoteSort: false,
	listeners: {
	    exception: failure_store
	},
	sortInfo: {
	    field: 'rec_id',
	    direction: 'ASC'
	}
    });

    var shoppingStore = new Ext.data.Store({
	proxy: new Ext.data.HttpProxy({
	    api: {
		read: '/recipe/admin/lists/shopping-list'
	    },
	    method : 'post'
	}),
	reader: shoppingReader,
	remoteSort: false,
	listeners: {
	    exception: failure_store
	},
	sortInfo: {
	    field: 'sho_id',
	    direction: 'ASC'
	}
    });

    var ingredientEditWindow = ingredientListWindowFactory({
	getSelected: function(){
	    return ingredientSelectedRecord;
	},
	loadStore:ingredientLoadStore
    });

    var recipeEditWindow = recipeListWindowFactory({
	getSelected: function(){
	    return recipeSelectedRecord;
	},
	loadStore:recipeLoadStore
    });

    var ingredientAddButton = new Ext.Button({
	text: 'Add ingredient',
	listeners: {
	    click: function(){
		ingredientEditWindow.openAdd();
	    }
	}
    });

    var recipeAddButton = new Ext.Button({
	text: 'Add recipe',
	listeners: {
	    click: function(){
		recipeEditWindow.openAdd();
	    }
	}
    });

    function ingredientDoEdit() {
	if (ingredientSelectedRecord) {
	    ingredientEditWindow.openEdit();
	}
    };

    function recipeDoEdit() {
	if (recipeSelectedRecord) {
	    recipeEditWindow.openEdit();
	}
    };

    var ingredientEditButton = new Ext.Button({
	text: 'Change amount',
	disabled: true,
	listeners: {
	    click: ingredientDoEdit
	}
    });

    var recipeEditButton = new Ext.Button({
	text: 'Change amount',
	disabled: true,
	listeners: {
	    click: recipeDoEdit
	}
    });

    var ingredientDeleteButton = new Ext.Button({
	text: 'Delete',
	disabled: true
    });

    ingredientDeleteButton.on('click', function(){
	if (ingredientSelectedRecord) {
	    Ext.Ajax.request({
		url: '/recipe/admin/lists/ingredient-delete',
		success: function(response,options){
		    if (success_ajax(response,options))
			ingredientLoadStore();
		},
		failure: failure_ajax,
		params: { ing_id: ingredientSelectedRecord.data.ing_id }
	    });
	}
	ingredientClearSelection();
    });

    var recipeDeleteButton = new Ext.Button({
	text: 'Delete',
	disabled: true
    });

    recipeDeleteButton.on('click', function(){
	if (recipeSelectedRecord) {
	    Ext.Ajax.request({
		url: '/recipe/admin/lists/recipe-delete',
		success: function(response,options){
		    if (success_ajax(response,options))
			recipeLoadStore();
		},
		failure: failure_ajax,
		params: { rec_id: recipeSelectedRecord.data.rec_id }
	    });
	}
	recipeClearSelection();
    });

    function ingredientClearSelection() {
	if (ingredientGrid) {
	    ingredientGrid.getSelectionModel().clearSelections();
	    ingredientGrid.getSelectionModel().fireEvent('rowdeselect');
	}
	ingredientSelectedRecord = null;
    }

    function recipeClearSelection() {
	if (recipeGrid) {
	    recipeGrid.getSelectionModel().clearSelections();
	    recipeGrid.getSelectionModel().fireEvent('rowdeselect');
	}
	recipeSelectedRecord = null;
    }

    function shoppingClearSelection() {
	if (shoppingGrid) {
	    shoppingGrid.getSelectionModel().clearSelections();
	    shoppingGrid.getSelectionModel().fireEvent('rowdeselect');
	}
	shoppingSelectedRecord = null;
    }

    var ingredientTitleBar = new Ext.Toolbar({
	autoHeight: true,
	autoWidth: true,
	items: [
	    '<a href="/recipe/admin/lists/view">Back to list page</a>',
	    '-',
	    ingredientAddButton,
	    '-',
	    ingredientEditButton,
	    '-',
	    ingredientDeleteButton,
	    '-',
	    '->',
	    '-',
	    {
		xtype: 'tbtext',
		text: 'Ingredients for ' + list_name
	    },
	    '-'
	]
    });

    var recipeTitleBar = new Ext.Toolbar({
	autoHeight: true,
	autoWidth: true,
	items: [
	    '<a href="/recipe/admin/lists/view">Back to list page</a>',
	    '-',
	    recipeAddButton,
	    '-',
	    recipeEditButton,
	    '-',
	    recipeDeleteButton,
	    '-',
	    '->',
	    '-',
	    {
		xtype: 'tbtext',
		text: 'Recipes for ' + list_name
	    },
	    '-'
	]
    });

    function ingredientLoadStore() {
	ingredientStoreLoaded = false;
	ingredientStore.load({
	    params: {
		list_id: list_id
	    },
	    callback: function() {
		ingredientStoreLoaded = true;
		shoppingLoadStore();
	    }
	});
    }

    function recipeLoadStore() {
	recipeStoreLoaded = false;
	recipeStore.load({
	    params: {
		list_id: list_id
	    },
	    callback: function() {
		recipeStoreLoaded = true;
		shoppingLoadStore();
	    }
	});
    }

    function shoppingLoadStore() {
	shoppingStoreLoaded = false;
	shoppingStore.load({
	    params: {
		list_id: list_id
	    },
	    callback: function() {
		shoppingStoreLoaded = true;
	    }
	});
    }

    var ingredientModel = new Ext.grid.ColumnModel({
	columns: [{
	    header   : 'Id',
	    width    : 36,
	    dataIndex: 'ing_id',
	    sortable : true
	},{
	    header   : 'Name',
	    width    : 72,
	    dataIndex: 'ing_name',
	    sortable : true
	},{
	    header   : 'Amount',
	    width    : 160,
	    dataIndex: 'ing_amount',
	    sortable : true
	},{
	    header   : 'Unit',
	    width    : 72,
	    dataIndex: 'ing_unit',
	    sortable : true
	}],
	defaults: {
	    renderer: 'htmlEncode'
	}
    });

    var recipeModel = new Ext.grid.ColumnModel({
	columns: [{
	    header   : 'Id',
	    width    : 36,
	    dataIndex: 'rec_id',
	    sortable : true
	},{
	    header   : 'Name',
	    width    : 72,
	    dataIndex: 'rec_name',
	    sortable : true
	},{
	    header   : 'Amount',
	    width    : 160,
	    dataIndex: 'rec_amount',
	    sortable : true
	}],
	defaults: {
	    renderer: 'htmlEncode'
	}
    });

    var shoppingModel = new Ext.grid.ColumnModel({
	columns: [{
	    header   : 'Name',
	    width    : 72,
	    dataIndex: 'sho_name',
	    sortable : true
	},{
	    header   : 'Amount',
	    width    : 160,
	    dataIndex: 'sho_amount',
	    sortable : true
	},{
	    header   : 'Unit',
	    width    : 72,
	    dataIndex: 'sho_shop_unit',
	    sortable : true
	}],
	defaults: {
	    renderer: 'htmlEncode'
	}
    });

     var ingredientGridSelectionModel = new Ext.grid.RowSelectionModel({
	singleSelect: true,
	listeners: {
	    rowdeselect: function (sm, rowIndex, r) {
		ingredientSelectedRecord = null;
		ingredientDeleteButton.disable();
		ingredientEditButton.disable();
	    },
	    rowselect: function (sm, rowIndex, r) {
		ingredientSelectedRecord = r;
		if (ingredientSelectedRecord) {
		    ingredientDeleteButton.enable();
		    ingredientEditButton.enable();
		}
	    }
	}
    });

     var recipeGridSelectionModel = new Ext.grid.RowSelectionModel({
	singleSelect: true,
	listeners: {
	    rowdeselect: function (sm, rowIndex, r) {
		recipeSelectedRecord = null;
		recipeDeleteButton.disable();
		recipeEditButton.disable();
	    },
	    rowselect: function (sm, rowIndex, r) {
		recipeSelectedRecord = r;
		if (recipeSelectedRecord) {
		    recipeDeleteButton.enable();
		    recipeEditButton.enable();
		}
	    }
	}
    });

     var shoppingGridSelectionModel = new Ext.grid.RowSelectionModel({
	singleSelect: true,
	listeners: {
	    rowdeselect: function (sm, rowIndex, r) {
		shoppingSelectedRecord = null;
	    },
	    rowselect: function (sm, rowIndex, r) {
		shoppingSelectedRecord = r;
		if (shoppingSelectedRecord) {
		}
	    }
	}
    });

    var ingredientGrid = new Ext.grid.GridPanel({
	title: 'Ingredients on this list',
	store: ingredientStore,
	sm: ingredientGridSelectionModel,
	cm: ingredientModel,
	stripeRows: true,
	enableHdMenu: false,
	tbar: ingredientTitleBar,
	enableColumnHide : false,
	stateful   : true,
	stateId    : 'ingredientGridState',
	listeners: {
	    rowdblclick: ingredientDoEdit
	},
	viewConfig: {
	    forceFit: true,
	    getRowClass: function(record, rowIndex, rp, ds){
		    return 'foo';
	    },
	    templates: {
		cell: new Ext.Template(
		    '<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} '+
                        'x-selectable {css}" style="{style}" '+
                        'tabIndex="0" {cellAttr}>',
		    '<div class="x-grid3-cell-inner x-grid3-col-{id}" '+
                        '{attr}>{value}</div>',
		    '</td>'
		)
	    }
	}
    });
    ingredientLoadStore();

    var recipeGrid = new Ext.grid.GridPanel({
	title: 'Recipes on "' + list_name + '" list',
	store: recipeStore,
	sm: recipeGridSelectionModel,
	cm: recipeModel,
	stripeRows: true,
	enableHdMenu: false,
	tbar: recipeTitleBar,
	enableColumnHide : false,
	stateful   : true,
	stateId    : 'recipeGridState',
	listeners: {
	    rowdblclick: recipeDoEdit
	},
	viewConfig: {
	    forceFit: true,
	    getRowClass: function(record, rowIndex, rp, ds){
		    return 'foo';
	    },
	    templates: {
		cell: new Ext.Template(
		    '<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} '+
                        'x-selectable {css}" style="{style}" '+
                        'tabIndex="0" {cellAttr}>',
		    '<div class="x-grid3-cell-inner x-grid3-col-{id}" '+
                        '{attr}>{value}</div>',
		    '</td>'
		)
	    }
	}
    });
    recipeLoadStore();

    var shoppingGrid = new Ext.grid.GridPanel({
	title: 'Shopping list',
	store: shoppingStore,
	sm: shoppingGridSelectionModel,
	cm: shoppingModel,
	stripeRows: true,
	enableHdMenu: false,
	enableColumnHide : false,
	stateful   : true,
	stateId    : 'shoppingGridState',
	listeners: {
	},
	viewConfig: {
	    forceFit: true,
	    getRowClass: function(record, rowIndex, rp, ds){
		    return 'foo';
	    },
	    templates: {
		cell: new Ext.Template(
		    '<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} '+
                        'x-selectable {css}" style="{style}" '+
                        'tabIndex="0" {cellAttr}>',
		    '<div class="x-grid3-cell-inner x-grid3-col-{id}" '+
                        '{attr}>{value}</div>',
		    '</td>'
		)
	    }
	}
    });
    shoppingLoadStore();

    var subPanel = new Ext.Panel({
	layout: 'accordion',
	region: 'center',
	title: list_name,
	items: [recipeGrid,ingredientGrid,shoppingGrid]
    });

    var viewport = new Ext.Viewport({
	layout: 'border',
	autoHeight: true,
	autoWidth: true,
	renderTo: body,
	items: [subPanel]
    });
    viewport.render();
});
