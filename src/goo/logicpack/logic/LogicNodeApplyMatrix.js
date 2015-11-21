var LogicLayer = require('../../logic/LogicLayer');
var LogicNode = require('../../logic/LogicNode');
var LogicNodes = require('../../logic/LogicNodes');
var LogicInterface = require('../../logic/LogicInterface');
var Vector3 = require('../../math/Vector3');
var Matrix3 = require('../../math/Matrix3');

function (LogicLayer, LogicNode, LogicNodes, LogicInterface, Vector3, Matrix3) {
	'use strict';

	/**
	 * Logic node for vector < matrix computation
	 * @private
	 */
	function LogicNodeApplyMatrix() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeApplyMatrix.logicInterface;
		this.type = 'LogicNodeApplyMatrix';
		this.vec = new Vector3();
	}

	LogicNodeApplyMatrix.prototype = Object.create(LogicNode.prototype);
	LogicNodeApplyMatrix.editorName = 'ApplyMatrix';

	LogicNodeApplyMatrix.prototype.onInputChanged = function (instDesc) {
		var vec = LogicLayer.readPort(instDesc, LogicNodeApplyMatrix.inportX);
		var mat = LogicLayer.readPort(instDesc, LogicNodeApplyMatrix.inportY);
		this.vec.copy(vec);
		mat.applyPost(this.vec);
		LogicLayer.writeValue(this.logicInstance, LogicNodeApplyMatrix.outportProduct, this.vec);
	};

	LogicNodeApplyMatrix.logicInterface = new LogicInterface();
	LogicNodeApplyMatrix.outportProduct = LogicNodeApplyMatrix.logicInterface.addOutputProperty('product', 'Vector3');
	LogicNodeApplyMatrix.inportX = LogicNodeApplyMatrix.logicInterface.addInputProperty('vec', 'Vector3', new Vector3());
	LogicNodeApplyMatrix.inportY = LogicNodeApplyMatrix.logicInterface.addInputProperty('mat', 'Matrix3', new Matrix3());

	LogicNodes.registerType('LogicNodeApplyMatrix', LogicNodeApplyMatrix);



	return LogicNodeApplyMatrix;
});