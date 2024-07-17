package com.example.tooltip.overlaytooltip;

import com.vaadin.flow.component.Component;
import com.vaadin.flow.component.Tag;
import com.vaadin.flow.component.dependency.JsModule;
import com.vaadin.flow.component.dependency.NpmPackage;

@Tag("rich-tooltip")
@JsModule("./components/rich-tooltip.js")
@NpmPackage(value = "@polymer/iron-media-query", version = "^3.0.1")
public class RichTooltip extends Component {

    public RichTooltip(String target, String content) {
        getElement().setProperty("for", target);
        getElement().setProperty("text", content);
    }
}
