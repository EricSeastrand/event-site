<?php

class Template {
	var $templateDirectory;
	var $renderedHTML = '';
	var $stash;

	function __construct() {
		
	}
	
	function renderPage( $pageName ) {
		$this->renderTemplate( 'HEADER' );
		$this->renderTemplate( $pageName );
		$this->renderTemplate( 'FOOTER' );
	}

	function renderTemplate( $templateName ) {
		$this->_renderTemplate( $this->templateDirectory . $templateName . '.tpl' );
	}

	function _renderTemplate( $templatePath ) {
		if( !file_exists( $templatePath.'.htm' ) ) {
			ob_start(); // Start output buffering.
			// Instead of outputting anything, the output is now stored in a buffer.
			include( $templatePath.'.php' );
			// There, now the file has been included and php parsed.
			// It isn't output, it goes into the buffer.
			$templateHTML = ob_get_clean();
			// Now we read everything that has been buffered... And stops buffering.
		} else {
			$templatePath .= '.htm';
			$templateHTML = file_get_contents( $templatePath );
		}
		
		
		if(!$templateHTML)
			error_log('Attempted to render non-existent template file: '.$templatePath );
	
		foreach( $this->stash as $key=>$val ) {
			$templateHTML = str_replace("[% $key %]", htmlentities($val), $templateHTML );
		}
		//print_r($templateHTML);
		$this->renderedHTML .= $templateHTML;
	}

}
?>
