package com.example.ubuntas.myapplication;

import java.util.ArrayList;
import java.util.Random;
import java.util.StringTokenizer;

import android.app.Activity;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v7.app.ActionBarActivity;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.view.inputmethod.EditorInfo;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.ArrayAdapter;
import android.widget.TextView;

public class ChatController {
    private Activity act = null;

    private EditText msg_edittext;
    private ListView msgListView;
    private String[] messsages = {"123", "456"};
    private ArrayList<String> list;
    private ArrayAdapter<String> adapter;

    public void init(Activity activity) {
        act = activity;

        msg_edittext = (EditText) act.findViewById(R.id.messageEditText);
        msgListView = (ListView) act.findViewById(R.id.msgListView);

        list = new ArrayList<String>();
        for (int i = 0; i < messsages.length; ++i) {
            list.add(messsages[i]);
        }
        adapter = new ArrayAdapter(act,
                android.R.layout.simple_list_item_1, list);

        msgListView.setAdapter(adapter);

        msgListView.setTranscriptMode(ListView.TRANSCRIPT_MODE_ALWAYS_SCROLL);
        msgListView.setStackFromBottom(true);
    }

    public void sendMessage() {
            String msg = msg_edittext.getText().toString();
            msg_edittext.getText().clear();

            if (msg.length() > 0) {
                list.add(msg);
                adapter.notifyDataSetChanged();
            }
    }
}
