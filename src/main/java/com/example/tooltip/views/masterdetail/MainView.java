package com.example.tooltip.views.masterdetail;

import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.router.RouterLink;

@Route("")
public class MainView extends Div {

	public MainView() {		
		add(new RouterLink("Master Detail",MasterDetailView.class));
	}
}
