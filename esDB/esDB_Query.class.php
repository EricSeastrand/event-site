<?php

class esDB_Query {
	var $fields;
	var $query;
	
	var $joins  = array();
	var $filters = array();
	
	var $queryJoins;
	var $queryGroupBy;
	
	var $placeholderValues = array();
	var $placeholderTypes  = array();
	
	var $tables;  // Gets populated automatically with table names.
	var $_tables; // $_tables['tblName'] becomes true when that table is used in the query.
	
	var $queryFields;
	var $queryTables;
	
	
	function __construct() {
		
	}
	
	
	function setFields($fieldsArray) {
		if( !is_array( $fieldsArray ) )
			throw new Exception('Attempt to set desired fields to something other than an array.');
		
		$this->fields = $fieldsArray;
	}
	
	function getQuery() {
		if(!$this->query)
			$this->buildQuery();
		
		return $this->query;
	}
	/*
	function _buildWhere() {
		$this->_buildWhere_Joins();
		$this->_buildWhere_Filters();
		
		$this->queryWhere = @join( array_merge($this->_joins, $this->_filters) , ' AND ');
	}
	*/
	function _buildWhere() {
		$this->_buildWhere_Filters();
		
		$this->queryWhere = @join( $this->_filters , ' AND ');
	}
	
	function _buildWhere_Filters() {
		$filters = array();
		
		foreach( @$this->filters as $filterCol=>$filterVal ) {
			$filters[] = "$filterCol=?";
			
			$this->placeholderValues[] = $filterVal;
			$this->placeholderTypes[]  = 's';
			
			list($tableName, $tableCol) = explode('.', $filterCol);
			$this->_tables[$tableName] = true; // Hackish way of avoiding duplicate values.
		}
		
		return
			$this->_filters = $filters;
	}
	
	function _buildWhere_Joins() {
		$joins = array();
		
		foreach( @$this->joins as $joinFrom=>$joinTo ) {
			$joins[] = "$joinFrom=$joinTo";
		}
		
		return $this->_joins = $joins;
	}
	
	function _buildJoins() {
		if(! @$this->joins )
			return;
		
		$joins = array();
		
		$joinTables = array();
		$tablesUsed = $this->tables;
		foreach( $tablesUsed as $tableName ) {
			if($this->mainTable != $tableName)
				$joinTables[] = $tableName;
		}
		$joinTables = join($joinTables, ',');
		
		foreach( $this->joins as $joinFrom=>$joinTo ) {
			$joins[] = "$joinFrom=$joinTo";
		}
		$joins = join($joins, ' AND ');
		
		if($joins)
			$this->queryJoins = "($joinTables) ON ($joins)";
		
		return $this->queryJoins;
	}
	
	function _buildFields( $removeTableName = false ) {
		foreach( $this->fields as $nativeKey ) {
			list($tableName, $tableCol) = explode('.', $nativeKey);
			$this->_tables[$tableName] = true; // Hackish way of avoiding duplicate values.
			
			if($removeTableName)
				$nativeKey = $tableCol;
			
			$fields[] = $nativeKey;				
		}
		
		return
			$this->queryFields = join($fields, ', ');
	}
	
	function _buildTables() {
		$this->tables = array_keys( $this->_tables );

		return
			$this->queryTables = join($this->tables, ',');
	}
	
	
}

?>
